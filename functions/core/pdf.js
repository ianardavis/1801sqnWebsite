const fs     = require( 'fs' );
const pdf    = require( 'pdfkit' );
const bwipjs = require( 'bwip-js' );
module.exports = function ( m, fn ) {
    fn.pdfs = {};
    fn.pdfs.create = function ( id, folder, name, author ) {
        return new Promise( ( resolve, reject ) => {
            try {
                fn.fs.mkdir( folder )
                .then( result => {
                    const filename = `${ id }-${ name }.pdf`;
                    const path = fn.publicFile( folder, filename );
                    let docMetadata = {};
                    let writeStream = fs.createWriteStream( path, { flags: 'w' } );
                    
                    docMetadata.Title = `${ id }-${ folder }-${ name }`;
                    if ( author ) docMetadata.Author = `${ ( author.rank ? author.rank.rank : "" ) } ${ author.full_name }`;
                    docMetadata.bufferPages   = true;
                    docMetadata.autoFirstPage = false;
                    const doc = new pdf( docMetadata );
                    doc.pipe( writeStream );
                    doc.font( `${ process.env.ROOT }/public/lib/fonts/myriad-pro/d (1).woff` );
                    resolve( [ doc, filename, writeStream ] );
                })
                .catch( reject );
            } catch ( err ) {
                console.error( err );
                reject( err );
            };
        });
    };
    fn.pdfs.newPage = function ( doc ) {
        let pageMetaData = {};
        pageMetaData.size    = 'A4';
        pageMetaData.margins = 28;
        doc.addPage( pageMetaData );
        return 28;
    };
    fn.pdfs.logos = function ( doc, y, title ) {
        doc
            .image( `${ process.env.ROOT }/public/img/rafac_logo.png`, 28,  y, { height: 80 } )
            .image( `${ process.env.ROOT }/public/img/sqnCrest.png`,   470, y, { height: 80 } )
            .fontSize( 30 )
            .text( '1801 SQUADRON ATC', 28, y, { width: 539, align: 'center' } )
            .text( title,  28, y+40, { width: 539, align: 'center' } );
        return 85;
    };
    fn.pdfs.pageNumbers = function ( doc, file_id ) {
        const range = doc.bufferedPageRange();
        doc.fontSize( 10 );
        for ( let i = range.start; i < range.count; i++ ) {
            const bar = fn.publicFile( 'barcodes',`${ file_id }_128.png` )
            const qr  = fn.publicFile( 'barcodes',`${ file_id }_qr.png` )
            doc.switchToPage( i );
            doc
            .text( `Page ${ i + 1 } of ${ range.count }`, 28, 723.89 )
            .image( bar, 28,  738.89, { width: 434, height: 75 } )
            .image( qr,  492, 738.89, { width: 75,  height: 75 } );
        };
    };
    fn.pdfs.endOfPage = function ( doc, y ) {
        doc.text( 'END OF PAGE', 28, y, { width: 539, align: 'center' } );
        y = fn.pdfs.newPage( doc );
        return y;
    };
    fn.pdfs.createBarcode = function( text, type, options ) {
        return new Promise( ( resolve, reject ) => {
            fn.fs.mkdir( 'barcodes' )
            .then( path => {
                bwipjs.toBuffer({
                    bcid:        type, // Barcode type
                    text:        text, // Text to encode
                    borderleft:  5,
                    borderright: 5,
                    backgroundcolor: 'FFFFFF',
                    barcolor:        '000000',
                    ...options
                })
                .then( barcode => {
                    const file = fn.publicFile( 'barcodes', `${ text }_${ type }.png` );
                    fs.writeFile( file, barcode, () => resolve( file ) );
                })
                .catch( reject );
            })
            .catch( reject );
        });
    };
    fn.pdfs.createBarcodes = function ( text, options = {} ) {
        return new Promise( ( resolve, reject ) => {
            Promise.allSettled([
                fn.pdfs.createBarcode( text, 'code128', { scale: 3, height: 15, includetext: false, ...options } ),
                fn.pdfs.createBarcode( text, 'qrcode',  { scale: 3, height: 30, includetext: false, ...options } )
            ])
            .then( ( [ file_128, file_qr ] ) => resolve( [ file_128.value, file_qr.value ] ) )
            .catch( reject );
        });
    };
};