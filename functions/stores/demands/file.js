module.exports = function ( m, fn ) {
    const excel = require( 'exceljs' );
    fn.demands.file.create = function ( [ demand_id, user ] ) {
        function checkDemand() {
            return new Promise( ( resolve, reject ) => {
                m.demands.findOne({
                    where: { demand_id: demand_id },
                    include: [{
                        model:   m.demand_lines,
                        as:      'lines',
                        where:   { status: 2 },
                        include: [
                            m.orders,
                            {
                                model:   m.sizes,
                                include: [
                                    { model: m.items, as: 'item' },
                                    m.details
                                ],
                                as:      'size'
                            }
                        ]
                    }]
                })
                .then( fn.rejectIfNull )
                .then( demand => {
                    if ( demand.status !== 2 ) {
                        reject( new Error( 'This demand is not complete' ) );
    
                    } else if ( !demand.lines || demand.lines.length === 0 ) {
                        reject( new Error( 'No valid lines for this demand' ) );
    
                    } else {
                        resolve( demand );
    
                    };
                })
                .catch( reject );
            });
        };
        function createFile( demand ) {
            function getTemplate( supplier_id )  {
                return new Promise( ( resolve, reject ) => {
                    m.suppliers.findOne({
                        where: { supplier_id: supplier_id},
                        include: [{
                            model: m.files,
                            where: { description: 'Demand' },
                            required: false,
                            include: [{
                                model: m.file_details,
                                as: 'details'
                            }]
                        }]
                    })
                    .then( fn.rejectIfNull )
                    .then( supplier => {
                        if ( !supplier.files ) {
                            reject( new Error( 'No demand template for this supplier' ) );
        
                        } else if ( supplier.files.length !== 1 ) {
                            reject( new Error( `${ supplier.files.length } demand templates for this supplier` ) );
        
                        } else if ( !supplier.account ) {
                            reject( new Error( 'No account for this supplier' ) );
        
                        } else {
                            resolve( [ supplier.files[0], supplier.account ] );
        
                        };
                    })
                    .catch( reject );
                });
            };
            return new Promise( ( resolve, reject ) => {
                Promise.all([
                    getTemplate( demand.supplier_id ),
                    fn.fs.folderExists( 'demands', true )
                ])
                .then( ( [ [ file, account ], folderPath ] ) => {
                    if ( file.filename ) {
                        const filename = `demand_${ demand.demand_id }.xlsx`;
                        fn.fs.copyFile(
                            fn.publicFile( 'files', file.filename ),
                            fn.publicFile( 'demands', filename )
                        )
                        .then( result => resolve( [ filename, file, account, demand ] ) )
                        .catch( reject );
    
                    } else {
                        reject( new Error( 'No demand file specified' ) );
    
                    };
                })
                .catch( reject );
            });
        };
        function writeFile( [ filename, file, account, demand ] ) {
            function writeCoverSheet( workbook ) {
                function fileDetail( details, name ) {
                    const detail = details.filter( d => d.name.toLowerCase() === name );
                    if ( detail ) {
                        return detail[0].value;
            
                    } else {
                        return '';
            
                    };
                };
                function getCells( file ) {
                    return new Promise( resolve => {
                        let cells = {};
                        [
                            'code',
                            'name',
                            'rank',
                            'holder',
                            'squadron',
                            'date',
                            'rank column',
                            'name column',
                            'user start',
                            'user end'
                        ].forEach( e => {
                            const detail = fileDetail( file.details, e );
                            if ( detail ) {
                                cells[ e.replace( ' ', '_' ) ] = detail[0].value
                                
                            };
                        });
                        resolve( cells );
                    });
                };
                return new Promise( ( resolve, reject ) => {
                    Promise.all([
                        fn.demands.findUsers( demand.demand_id ),
                        getCells( file )
                    ])
                    .then( ( [ users, cells ] ) => {
                        const coverSheet = fileDetail( file.details, 'cover sheet' );
                        if ( coverSheet ) {
                            function setCell( cell, value ) {
                                worksheet.getCell( cell ).value = value;
                            };
                            function writeDetails() {
                                if ( cells.code     ) setCell( cells.code,     account.number );
                                if ( cells.name     ) setCell( cells.name,     user.full_name );
                                if ( cells.rank     ) setCell( cells.rank,     user.rank.rank );
                                if ( cells.holder   ) setCell( cells.holder,   `${ account.user.rank.rank } ${ account.user.full_name }` );
                                if ( cells.squadron ) setCell( cells.squadron, account.name );
                                if ( cells.date     ) setCell( cells.date,     new Date().toDateString() );
                            };
                            function writeUsers() {
                                if (
                                    users &&
                                    cells.rank_column &&
                                    cells.name_column &&
                                    cells.user_start  &&
                                    cells.user_end
                                ) {
                                    let r = Number( cells.user_start );
                                    users.foreach( user => {
                                        if ( r <= Number( cells.user_end ) ) {
                                            setCell( cells.rank_column + r, user.rank.rank );
                                            setCell( cells.name_column + r, user.full_name );
                                        };
                                        r++;
                                    });
    
                                };
                            };
                            let worksheet = workbook.getWorksheet( coverSheet );
                            writeDetails();
                            writeUsers();
                            resolve( workbook );
        
                        } else {
                            reject( new Error( 'No cover sheet specified' ) );
        
                        };
                    })
                    .catch( reject );
                });
            };
            function writeItems( workbook ) {
                function getSizes() {
                    
                    return new Promise( ( resolve, reject ) => {
                        let sizes = [];
                        demand.lines.forEach( line => {
                            const demand_page_index = line.size.details.findIndex( e => e.name === 'Demand Page' );
                            const demand_cell_index = line.size.details.findIndex( e => e.name === 'Demand Cell' );
                            let qty = 0;
                            line.orders.forEach( order => {
                                if ( order.status > 0 ) qty += order.qty;

                            });
                            if (
                                line.size.supplier_id === demand.supplier_id &&
                                demand_page_index !== -1 &&
                                demand_cell_index !== -1
                            ) {
                                const demand_page = line.size.details[ demand_page_index ].value;
                                const demand_cell = line.size.details[ demand_cell_index ].value;
                                if ( demand_page && demand_cell ) {
                                    const size_index = sizes.findIndex( e => e.size_id === line.size_id );
                                    if ( size_index === -1 ) {
                                        sizes.push({
                                            size_id: line.size_id,
                                            qty:     qty,
                                            page:    demand_page,
                                            cell:    demand_cell
                                        });
                                        
                                    } else {
                                        sizes[ size_index ].qty += qty;
                                        
                                    };
                                };
                                
                            };
                        });
                        if ( sizes.length > 0 ) {
                            resolve( sizes );
            
                        } else {
                            reject( new Error( 'No sizes for this supplier with demand details' ) );
            
                        };
                    });
                };
                function writeSizes( sizes ) {
                    return new Promise( resolve => {
                        let fails = [];
                        sizes.forEach( size => {
                            try {
                                let sheet = workbook.getWorksheet( size.page );
                                let cell  = sheet.getCell( size.cell );
                                cell.value = size.qty;
    
                            } catch ( err ) {
                                fails.push( { size_id: size.size_id, reason: err.message } );
    
                            };
                        });
                        resolve( workbook );
                    });
                };
                return new Promise( ( resolve, reject ) => {
                    getSizes()
                    .then( writeSizes )
                    .then( resolve )
                    .catch( reject );
                });
            };
            return new Promise( ( resolve, reject ) => {
                const path   = fn.publicFile( 'demands', filename );
                let workbook = new excel.Workbook();
                workbook.xlsx.readFile( path )
                .then( () => {
                    writeCoverSheet( workbook )
                    .then( writeItems )
                    .then( workbook => {
                        workbook.xlsx.writeFile( path )
                        .then( () => resolve( { filename: filename, account_id: account.account_id } ) )
                        .catch( reject );
                    })
                    .catch( reject );
                })
                .catch( reject );
            });
        };

        return new Promise( ( resolve, reject ) => {
            checkDemand()
            .then( demand => {
                if ( demand.filename && demand.filename !== '' ) {
                    resolve( demand.filename );

                } else {
                    createFile( demand, user )
                    .then( writeFile )
                    .then( demand.update )
                    .then( demand.reload )
                    .then( result => resolve( demand.filename ) )
                    .catch( reject );

                };
            })
            .catch( reject );
        });
    };
};