const fs = require( "fs" );
module.exports = function ( m, fn ) {
    fn.settings = {
        logs: {}
    };
    fn.settings.find = function ( where ) {
        return new Promise( ( resolve, reject ) => {
            m.settings.findAll({
                where: where
            })
            .then( fn.rejectIfNull )
            .then( settings => {
                if ( settings.length > 1 ) {
                    reject( new Error('Multiple settings found' ) );

                } else {
                    resolve( settings[0] );
                
                };
            })
            .catch( reject );
        });
    };
    fn.settings.findAll = function ( query ) {
        return new Promise( ( resolve, reject ) => {
            m.settings.findAll({
                where:      query.where,
                attributes: [ 'setting_id','name', 'value' ],
                ...fn.pagination( query )
            })
            .then( resolve )
            .catch( reject );
        });
    };

    fn.settings.edit = function ( setting_id, details ) {
        return new Promise( ( resolve, reject ) => {
            m.settings.findOne({
                where: { setting_id: setting_id }
            })
            .then( fn.rejectIfNull )
            .then( setting => {
                setting.update( details )
                .then( fn.checkResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.settings.set = function ( name, value ) {
        return new Promise( ( resolve, reject ) => {
            m.settings.findOrCreate({
                where:    { name:  name },
                defaults: { value: value }
            })
            .then( ( [ setting, created ] ) => {
                if ( created ) {
                    resolve(true);

                } else {
                    setting.update( { value: value } )
                    .then( fn.checkResult )
                    .then( resolve )
                    .catch( reject );

                };
            })
            .catch( reject );
        });
    };
    fn.settings.delete = function ( setting_id ) {
        return new Promise( ( resolve, reject ) => {
            m.settings.findOne({
                where: { setting_id: setting_id }
            })
            .then( fn.rejectIfNull )
            .then( setting => {
                setting.destroy()
                .then( fn.checkResult )
                .then( resolve )
                .catch( reject );
            })
            .catch( reject );
        });
    };

    fn.settings.logs.find = function ( type, res ) {
        return new Promise( ( resolve, reject ) => {
            m.settings.findOne({
                where: { name: `log ${ type || '' }` }
            })
            .then( fn.rejectIfNull )
            .then(setting => {
                let readStream = fs.createReadStream( setting.value );
                readStream.on( 'open',  ()  => { readStream.pipe( res ) } );
                readStream.on( 'close', ()  => { res.end() } );
                readStream.on( 'error', err => {
                    console.error( err );
                    res.end();
                });
                resolve( true );
            })
            .catch( reject );
        });
    };

    fn.settings.runCommand = function ( command ) {
        return new Promise( ( resolve, reject ) => {
            try {
                const output = fn.runCommand( command );
                console.log( output );
                resolve( true );

            } catch ( err ) {
                reject( err );
                
            };
        });
    };
};