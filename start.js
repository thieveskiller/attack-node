const http = require( "./http" );
const random = require( "./random" );
const config = JSON.parse( process.env.config );
const delay = Number( process.env.delay );

const success = ( data, regexp ) => {
    let reg = new RegExp( regexp );
    if ( reg.test( data ) ) {
        return true;
    } else {
        return false;
    }
}

process.on( 'message', ( msg ) => {
    if ( msg[ 0 ] == "exit" ) {
        clearInterval( timer );
        process.exit( 0 );
    }
} )

let timer = setInterval( () => {
    config.forEach( e => {
        let method = e.method;
        let url = e.url;
        let referer = e.referer;
        let data = e.data;

        if ( method == "GET" ) {
            let uri = eval( "`" + url + "`" );
            http.get( uri, referer, ( err, res, body ) => {
                try {
                    let code = res.statusCode;
                    if ( err ) {
                        process.send( {
                            type: "request",
                            data: [ err, null, null, uri ]
                        } );
                    } else {
                        if ( success( body, config.check ) ) {
                            process.send( {
                                type: "request",
                                data: [ err, code, body, uri ]
                            } );
                        } else {
                            process.send( {
                                type: "request",
                                data: [ new Error( "fail" ), code, body, uri ]
                            } );
                        }
                    }
                } catch ( error ) {
                    process.send( {
                        type: "request",
                        data: [ err, null, null ]
                    } );
                }
            } )
        } else if ( method == "POST" ) {
            let dat = eval( "`" + data + "`" );
            let uri = eval( "`" + url + "`" );
            http.post( uri, referer, dat, ( err, res, body ) => {
                try {
                    let code = res.statusCode;
                    if ( err ) {
                        process.send( {
                            type: "request",
                            data: [ err, null, null, uri ]
                        } );
                    } else {
                        process.send( {
                            type: "request",
                            data: [ err, code, body, uri ]
                        } );
                    }
                } catch ( error ) {
                    process.send( {
                        type: "request",
                        data: [ err, null, null, uri ]
                    } );
                }
            } )
        }
    } );
}, delay )