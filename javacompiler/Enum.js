const {Type} = require("./Type.js");

class EnumConstant {
    constructor(node){
        this.name = node.children.Identifier[0].image;
    }
}

class Enum extends Type {
    constructor( node, parent ){
        super(node, "enumDeclaration", "enum class", parent);
        this.isEnum = true;
        
        // ast(node);
        this.constantList = node.children
            .enumDeclaration[0].children
            .enumBody[0].children
            .enumConstantList[0].children
            .enumConstant.map( ec => new EnumConstant(ec) );
    }

    resolve( fqcn, trail ){
        // console.log("FQCN clazz: ", fqcn);
        if( !fqcn.length )
            return this;

        let fqcnbackup = fqcn;

        fqcn = [...fqcn];
        let name = fqcn.shift();
        
        for( let type of this.constantList ){
            if( type.name == name ){
                trail.push( type );
                if( !fqcn.length ){
                    return type;
                }
                return type.resolve( fqcn, trail );
            }
        }

        return null;
    }

}

module.exports = { Enum, EnumConstant };
