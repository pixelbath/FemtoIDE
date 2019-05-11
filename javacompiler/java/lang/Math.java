package java.lang;

import java.util.Random;

public class Math implements __stub__ {

    public static final float PI = 3.1415926535897932384626433832795028841971f;

    public static double abs( double a ){
        if( a < 0 ) return -a;
        return a;
    }
    public static float abs( float a ){
        if( a < 0 ) return -a;
        return a;
    }
    public static int abs( int a ){
        if( a < 0 ) return -a;
        return a;
    }
    public static long abs( long a ){
        if( a < 0 ) return -a;
        return a;
    }

    public static float floor( float a ){
        return (float) __inline_cpp__("a.getInteger()");
    }
    public static float round( float a ){
        return __inline_cpp__("up_java::up_lang::uc_float::fromInternal((a.getInternal()+128)&~0xFF)");
    }
    public static float ceil( float a ){
        return __inline_cpp__("up_java::up_lang::uc_float::fromInternal((a.getInternal()+255)&~0xFF)");
    }

    private static Random rng;

    public static float random(){
        if( !rng ) rng = new Random();
        return rng.nextFloat();
    }

    public static int random(int min, int max){
        if( !rng ) rng = new Random();
        return rng.nextInt(max-min) + min;
    }
    
    public static float cos( float angle ){}

    public static float sin( float angle ){
        return cos( angle + PI );
    }

    public static float atan2( float fy, float fx ){}

    public static float sqrt( float x ){
        uint t, q, b, r;
        r = __inline_cpp__("x.getInternal()");
        b = 0x40000000;
        q = 0;
        while( b > 0x40 ){
            t = q;
            t += b;
            if( r >= t )
            {
                r -= t;
                q += b<<1;
            }
            r <<= 1;
            b >>= 1;
        }
        q >>= 12;
        return __inline_cpp__("up_java::up_lang::uc_float::fromInternal(q)");
    }
}