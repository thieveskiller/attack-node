const http = require( "./http" );
const random = require( "./random" );
const fs = require("fs");
const config = JSON.parse( fs.readFileSync("./config.json").toString() );
const thread = Number(config.global.thread);
const maxMemory = Number(config.global.maxMemory);
const delay = Number(config.global.delay);

const success = ( data, regexp ) => {
    let reg = new RegExp( regexp );
    if ( reg.test( data ) ) {
        return true;
    } else {
        return false;
    }
}

setInterval(() => {
    if((process.memoryUsage().heapUsed/1048576) > maxMemory){
        process.exit()
    }
}, 100);

process.on( 'message', ( msg ) => {
    if ( msg[ 0 ] == "exit" ) {
        timer.forEach(e => {
            clearInterval(e);
        })
        process.exit( 0 );
    }
} )

let timer = new Array();

for (let i = 0; i < thread; i++) {
    timer [i] = setInterval( () => {
        config.stream.forEach( e => {
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
}