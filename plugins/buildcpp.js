APP.addPlugin("BuildCPP", ["Build"], _=> {
    let buildFolder = "";
    let objFile = {};
    let nextObjFileId = 1;
    let libs = {};
    let objBuffer = null;

    APP.add({

        getCPPBuildFolder(){
            return buildFolder;
        },

        onOpenProject(){
            objBuffer = new Buffer();
            objBuffer.type = "o list";
            objFile = {};
            const tmpDir = require("os").tmpdir();
            fs.mkdtemp(`${tmpDir}${path.sep}`, (err, folder) => {
                buildFolder = folder;
                APP.customSetVariables({buildFolder});
            });
        },
        
        ["compile-cpp"]( files, cb ){
            objBuffer.data = [];
            let pending = new Pending(_=>{
                files.push(objBuffer);
                cb();
            }, err => {
                APP.error(err);
            });

            files.filter(f=>f.type=="C"
                         || f.type=="CPP"
                         || f.type=="S"
                        )
                .forEach( buffer =>{
                    pending.start();
                    compile(buffer, (err, id)=>{
                        if( err ) pending.error(err);
                        else addObj(id);
                    });
                });

            if( DATA.project.libs && DATA.project.libs[DATA.project.target] )
                DATA.project.libs[DATA.project.target].forEach( path => {
                    let id = libs[path];
                    pending.start();
                    if( !id ){
                        let buffer = new Buffer();
                        buffer.path = APP.replaceDataInString( path );
                        buffer.type = path.split(".").pop().toUpperCase();
                        compile(buffer, (err, objPath)=>{
                            if( err ) pending.error(err);
                            else{
                                libs[path] = objPath;
                                addObj(objPath);
                            }
                        });
                    }else{
                        addObj(id);
                    }
                });

            function addObj( objPath ){
                objBuffer.data.push(objPath);
                pending.done();
            }
            
        }
    });

    function compile( buffer, cb ){
        if( !buffer.path || buffer.modified ){
            
            if( !buffer.path )
                buffer.path = buildFolder + path.sep + buffer.name;

            APP.writeBuffer( buffer );
        }

        let compilerPath = DATA[
            buffer.type + "-" + DATA.project.target
        ] + DATA.executableExt;

        let flags = [buffer.path];

        let typeFlags = DATA.project[buffer.type+"Flags"];
        if( typeFlags ){
            if( typeFlags[DATA.project.target] )
                flags.push(...typeFlags[DATA.project.target]);
            if( typeFlags.ALL )
                flags.push( ...typeFlags.ALL );
            if( typeFlags[DATA.buildMode] )
                flags.push( ...typeFlags[DATA.buildMode] );
        }

        if( !objFile[ buffer.path ] )
            objFile[ buffer.path ] = nextObjFileId++;

        let id = objFile[ buffer.path ];

        flags.push("-o");
        
        let output = buildFolder + path.sep + objFile[buffer.path] + ".o";
        flags.push( output );

        APP.spawn( compilerPath, ...flags )
            .on("data-err", err =>{
                APP.error("CPP: " + err);
            })
            .on("data-out", msg=>{
                APP.log("CPP: " + msg);
            })
            .on("close", error=>{
                if( error ){
                    APP.displayBuffer( buffer );
                    cb( true );
                }else{
                    cb( null, output );
                }
            });

    }
});
