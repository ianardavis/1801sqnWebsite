const { scryptSync, randomBytes } = require( "crypto" );
module.exports = function ( m, fn ) {
    fn.users.password.generate = function () {
        const consenants = [ 'b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z' ];
        const vowels     = [ 'a','e','i','o','u','y' ];
        const pattern    = [ 'C','V','C','-','C','V','C','-','C','V','C' ];
        let plain      = '';
        let readable   = '';

        pattern.forEach(l => {
            const rand = Math.random();
            function randomLetter ( arr ) { return arr[ Math.floor( rand * arr.length ) ] }
            let letter = '-';
            if ( l === 'C' ) {
                letter = randomLetter( consenants );
                plain += letter;
                
            } else if ( l === 'V' ){
                letter = randomLetter( vowels );
                plain += letter;
                
            };
            readable += letter.toUpperCase();
        });
        return { plain: plain, readable: readable };
    };
    fn.users.password.encrypt = function ( plainText, salt = null ) {
        if ( !salt ) salt = randomBytes( 16 ).toString( "hex" )
        let password = scryptSync( plainText, salt, 128 ).toString( "hex" );
        return { salt: salt, password: password };
    };
    fn.users.password.edit = function ( user_id, password ) {
        return new Promise( ( resolve, reject ) => {
            fn.users.find( { user_id: user_id }, [ "user_id", "password", "salt" ] )
            .then( user => {
                if ( user.password === fn.users.password.encrypt( password, user.salt ).password ) {
                    reject( new Error( 'That is the current password!' ) );

                } else {
                    user.update({
                        ...fn.users.password.encrypt( password ),
                        reset: 0
                    })
                    .then( fn.checkResult )
                    .then( resolve )
                    .catch( reject );

                };
            })
            .catch( reject );
        });
    };
};