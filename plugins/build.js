APP.addPlugin("Build", ["Project"], _=>{
    APP.customSetVariables({buildMode:"RELEASE"});

    let build, busy, buildFiles;

    class Build {

        constructor(){
            APP.add(this);
            console.log("New builder");
        }

        onCloseProject(){
            APP.remove(this);
        }
        
        compileAndRun(){
            APP.stopEmulator();
            this.compile(true, _=>{
                APP.run();
            });
        }

        onAfterWriteBuffer(buffer){
            if( buildFiles && buildFiles.indexOf(buffer) == -1 && buffer.path.startsWith(DATA.projectPath)){
                buildFiles.push(buffer);
            }
        }

        compile( release=true, callback=null ){
            let timings = "",
                startTime = 0,
                stage = "";
            
            if( busy ){
                APP.log("Build already in progress");
                return;
            }

            busy = true;
            function cb(...args){
                busy = false;
                if( callback && typeof callback == "function" )
                    callback(...args);
                APP.onCompileComplete();
            }
            
            APP.clearLog();
            APP.customSetVariables({buildMode:release?"RELEASE":"DEBUG"});
            APP.setStatus("Compiling...");

            let pipeline, files, current;
            try{
                const target = DATA.project.target;
                pipeline = DATA.project.pipelines[target];
                files = buildFiles = [...DATA.projectFiles];
                current = -1;
                setTimeout(_=>popQueue(),0);
            }catch( ex ){
                APP.setStatus("Compilation FAILED");
                APP.error(ex);
                busy = false;
            }

            function popQueue( error ){
                if( startTime ){
                    let deltaTime = performance.now() - startTime;
                    timings += stage + ":" + Math.round(deltaTime/10)/100 + "s ";
                }
                
                if( error ){
                    busy = false;
                    APP.setStatus("Compilation FAILED");
                    if(Array.isArray(error))
                        APP.logDump(error, "error");
                    else
                        APP.error(error);
                    return;
                }

                current++;
                if( current >= pipeline.length ){
                    APP.setStatus("Build time: " + timings);
                    cb();
                    return;
                }

                stage = (pipeline[current]+"").trim();
                // APP.log("Starting stage: " + stage);
                startTime = performance.now();
                try{
                    if( stage[0] == "#" ){
                        APP.shell(stage.substr(1))
                            .on("close", error=>{
                                popQueue(error);
                            })
                            .on("error", error=>{
                                popQueue(error);
                            });
                    } else {
                        let ret = APP[stage]( files, popQueue );
                        if( ret instanceof Promise ){
                            ret.then(_=>popQueue())
                                .catch(ex=>popQueue(ex));
                        }
                    }
                }catch(ex){
                    popQueue(ex);
                }
            }
        }

    }

    APP.add({

        onOpenProject(){
            new Build();
        },

        queryMenus(){
            APP.addMenu("Build", {
                "Clean":"clean",
                "Build":"compile",
                "Run":"run",
                "Build & Run":"compileAndRun"
            });
        }

    });

});
