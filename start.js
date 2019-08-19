const http = require( "./http" );
const random = require( "./random" );
const fs = require( "fs" );
const config = JSON.parse( fs.readFileSync( "./config.json" ).toString() );
const thread = Number( config.global.thread );
const maxMemory = Number( config.global.maxMemory );
const delay = Number( config.global.delay );

const success = ( data, regexp ) => {
    let reg = new RegExp( regexp );
    if ( reg.test( data ) ) {
        return true;
    } else {
        return false;
    }
}

if ( maxMemory > 0 ) {
    setInterval( () => {
        if ( ( process.memoryUsage().heapUsed / 1048576 ) > maxMemory ) {
            process.exit()
        }
    }, 100 );
}

process.on( 'message', ( msg ) => {
    if ( msg[ 0 ] == "exit" ) {
        timer.forEach( e => {
            clearInterval( e );
        } )
        process.exit( 0 );
    }
} )

let timer = new Array();

for ( let i = 0; i < thread; i++ ) {
    timer[ i ] = setInterval( () => {
        config.stream.forEach( e => {
            let method = e.method;
            let url = e.url;
            let referer = e.referer;
            let data = e.data;

            let dat = eval( "`" + data + "`" );
            let uri = eval( "`" + url + "`" );
            /*
            process.send( {
                type: "request",
                data: [ err, code, body, uri ]
            } );
            */

            http({
                url: uri,
                method: method,
                data: dat,
                referer: referer
            },(err,data)=>{
                if(err){
                    process.send( {
                        type: "request",
                        data: [ err, null, null, uri ]
                    } );
                }else{
                    let code = data[0];
                    let body = data[1];
                    process.send( {
                        type: "request",
                        data: [ err, code, body, uri ]
                    } );
                }
            })
        } );
    }, delay )
}