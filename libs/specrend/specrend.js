/*
                      Jacob Aulenback
                           2020

    specrend.js is a lightly modified Javascript
    implementation of the same program by John Walker
    originally in C.

    This implementation is in the public domain as is the
    original program by John Walker.

    Below is the original header and license included
    in specrend.c

    =====================================================
    =====================================================

                Colour Rendering of Spectra

                       by John Walker
                  http://www.fourmilab.ch/

                 Last updated: March 9, 2003

           This program is in the public domain.

    For complete information about the techniques employed in
    this program, see the World-Wide Web document:

             http://www.fourmilab.ch/documents/specrend/

    The xyz_to_rgb() function, which was wrong in the original
    version of this program, was corrected by:

            Andrew J. S. Hamilton 21 May 1999
            Andrew.Hamilton@Colorado.EDU
            http://casa.colorado.edu/~ajsh/

    who also added the gamma correction facilities and
    modified constrain_rgb() to work by desaturating the
    colour by adding white.

    A program which uses these functions to plot CIE
    "tongue" diagrams called "ppmcie" is included in
    the Netpbm graphics toolkit:
        http://netpbm.sourceforge.net/
    (The program was called cietoppm in earlier
    versions of Netpbm.)

*/

const IlluminantCxWhite = 0.3101;
const IlluminantCyWhite = 3162;
const IlluminantD65xWhite = 0.3127;
const IlluminantD65yWhite = 0.3291;
const IlluminantExWhite = 0.33333333;
const IlluminantEyWhite = 0.33333333;

const GAMMA_REC709 = 0;

function colourSystem(name, xRed, yRed, xGreen, yGreen, xBlue, yBlue, xWhite, yWhite, gamma){
    return {name:name, xRed:xRed, yRed:yRed, xGreen:xGreen, yGreen,yGreen, xBlue:xBlue, yBlue:yBlue,
            xWhite:xWhite, yWhite:yWhite, gamma:gamma};
}

const NTSCsystem   = colourSystem( "NTSC",               0.67,   0.33,   0.21,   0.71,   0.14,   0.08,   IlluminantCxWhite,   IlluminantCyWhite,    GAMMA_REC709 );
const EBUsystem    = colourSystem( "EBU (PAL/SECAM)",    0.64,   0.33,   0.29,   0.60,   0.15,   0.06,   IlluminantD65xWhite, IlluminantD65yWhite,  GAMMA_REC709 );
const SMPTEsystem  = colourSystem( "SMPTE",              0.630,  0.340,  0.310,  0.595,  0.155,  0.070,  IlluminantD65xWhite, IlluminantD65yWhite,  GAMMA_REC709 );
const HDTVsystem   = colourSystem( "HDTV",               0.670,  0.330,  0.210,  0.710,  0.150,  0.060,  IlluminantD65xWhite, IlluminantD65yWhite,  GAMMA_REC709 );
const CIEsystem    = colourSystem( "CIE",                0.7355, 0.2645, 0.2658, 0.7243, 0.1669, 0.0085, IlluminantExWhite,   IlluminantEyWhite,    GAMMA_REC709 );
const Rec709system = colourSystem( "CIE REC 709",        0.64,   0.33,   0.30,   0.60,   0.15,   0.06,   IlluminantD65xWhite, IlluminantD65yWhite,  GAMMA_REC709 );

function upvp_to_xy(up, vp, xc, yc){
        xc.val = (9 * up) / ((6 * up) - (16 * vp) + 12);
        yc.val = (4 * vp) / ((6 * up) - (16 * vp) + 12);

}
function xp_to_upvp(xc, yc, up, vp){
        up.val = (4 * xc) / ((-2 * xc) + (12 * yc) + 3);
        vp.val = (9 * yc) / ((-2 * xc) + (12 * yc) + 3);

}

function xyz_to_rgb(cs, xc, yc, zc, r, g, b){
    var xr, yr, zr, xg, yg, zg, xb, yb, zb;
    var xw, yw, zw;
    var rx, ry, rz, gx, gy, gz, bx, by, bz;
    var rw, gw, bw;

    xr = cs.xRed;    yr = cs.yRed;    zr = 1 - (xr + yr);
    xg = cs.xGreen;  yg = cs.yGreen;  zg = 1 - (xg + yg);
    xb = cs.xBlue;   yb = cs.yBlue;   zb = 1 - (xb + yb);

    xw = cs.xWhite;  yw = cs.yWhite;  zw = 1 - (xw + yw);


    rx = (yg * zb) - (yb * zg);  ry = (xb * zg) - (xg * zb);  rz = (xg * yb) - (xb * yg);
    gx = (yb * zr) - (yr * zb);  gy = (xr * zb) - (xb * zr);  gz = (xb * yr) - (xr * yb);
    bx = (yr * zg) - (yg * zr);  by = (xg * zr) - (xr * zg);  bz = (xr * yg) - (xg * yr);


    rw = ((rx * xw) + (ry * yw) + (rz * zw)) / yw;
    gw = ((gx * xw) + (gy * yw) + (gz * zw)) / yw;
    bw = ((bx * xw) + (by * yw) + (bz * zw)) / yw;


    rx = rx / rw;  ry = ry / rw;  rz = rz / rw;
    gx = gx / gw;  gy = gy / gw;  gz = gz / gw;
    bx = bx / bw;  by = by / bw;  bz = bz / bw;


    r.val = (rx * xc) + (ry * yc) + (rz * zc);
    g.val = (gx * xc) + (gy * yc) + (gz * zc);
    b.val = (bx * xc) + (by * yc) + (bz * zc);

}

function inside_gamut( r, g, b){
    return (r.val >= 0) && (g.val >= 0) && (b.val >= 0);
}

function constrain_rgb( r, g, b){
    var w;

    w = (0 < r.val) ? 0 : r.val;
    w = (w < g.val) ? w : g.val;
    w = (w < b.val) ? w : b.val;
    w = -w;

    if (w > 0) {
        r.val += w;
        g.val += w;
        b.val += w;
        return true;
    }

    return false;
}

function gamma_correct(cs, c)
{
    var gamma;

    gamma = cs.gamma;

    if (gamma == GAMMA_REC709) {
        var cc = 0.018;

        if (c.val < cc) {
                c.val *= ((1.099 * Math.pow(cc, 0.45)) - 0.099) / cc;
        } else {
                c.val = (1.099 * Math.pow(c.val, 0.45)) - 0.099;
        }
    } else {
            c.val = Math.pow(c.val, 1.0 / gamma);
    }
}

function norm_rgb(r, g, b){
    function Max(a,b){
        return (((a) > (b)) ? (a) : (b));
    }

    var greatest = Max(r.val, Max(g.val, b.val));

    if (greatest > 0) {
        r.val /= greatest;
        g.val /= greatest;
        b.val /= greatest;
    }
}


function spectrum_to_xyz( spec_intens, x, y, z){
    var i;
    var lambda;
    var X,Y,Z;
    X = 0;
    Y = 0;
    Z = 0;
    var XYZ;

    var cie_colour_match = [
        [0.0014,0.0000,0.0065], [0.0022,0.0001,0.0105], [0.0042,0.0001,0.0201],
        [0.0076,0.0002,0.0362], [0.0143,0.0004,0.0679], [0.0232,0.0006,0.1102],
        [0.0435,0.0012,0.2074], [0.0776,0.0022,0.3713], [0.1344,0.0040,0.6456],
        [0.2148,0.0073,1.0391], [0.2839,0.0116,1.3856], [0.3285,0.0168,1.6230],
        [0.3483,0.0230,1.7471], [0.3481,0.0298,1.7826], [0.3362,0.0380,1.7721],
        [0.3187,0.0480,1.7441], [0.2908,0.0600,1.6692], [0.2511,0.0739,1.5281],
        [0.1954,0.0910,1.2876], [0.1421,0.1126,1.0419], [0.0956,0.1390,0.8130],
        [0.0580,0.1693,0.6162], [0.0320,0.2080,0.4652], [0.0147,0.2586,0.3533],
        [0.0049,0.3230,0.2720], [0.0024,0.4073,0.2123], [0.0093,0.5030,0.1582],
        [0.0291,0.6082,0.1117], [0.0633,0.7100,0.0782], [0.1096,0.7932,0.0573],
        [0.1655,0.8620,0.0422], [0.2257,0.9149,0.0298], [0.2904,0.9540,0.0203],
        [0.3597,0.9803,0.0134], [0.4334,0.9950,0.0087], [0.5121,1.0000,0.0057],
        [0.5945,0.9950,0.0039], [0.6784,0.9786,0.0027], [0.7621,0.9520,0.0021],
        [0.8425,0.9154,0.0018], [0.9163,0.8700,0.0017], [0.9786,0.8163,0.0014],
        [1.0263,0.7570,0.0011], [1.0567,0.6949,0.0010], [1.0622,0.6310,0.0008],
        [1.0456,0.5668,0.0006], [1.0026,0.5030,0.0003], [0.9384,0.4412,0.0002],
        [0.8544,0.3810,0.0002], [0.7514,0.3210,0.0001], [0.6424,0.2650,0.0000],
        [0.5419,0.2170,0.0000], [0.4479,0.1750,0.0000], [0.3608,0.1382,0.0000],
        [0.2835,0.1070,0.0000], [0.2187,0.0816,0.0000], [0.1649,0.0610,0.0000],
        [0.1212,0.0446,0.0000], [0.0874,0.0320,0.0000], [0.0636,0.0232,0.0000],
        [0.0468,0.0170,0.0000], [0.0329,0.0119,0.0000], [0.0227,0.0082,0.0000],
        [0.0158,0.0057,0.0000], [0.0114,0.0041,0.0000], [0.0081,0.0029,0.0000],
        [0.0058,0.0021,0.0000], [0.0041,0.0015,0.0000], [0.0029,0.0010,0.0000],
        [0.0020,0.0007,0.0000], [0.0014,0.0005,0.0000], [0.0010,0.0004,0.0000],
        [0.0007,0.0002,0.0000], [0.0005,0.0002,0.0000], [0.0003,0.0001,0.0000],
        [0.0002,0.0001,0.0000], [0.0002,0.0001,0.0000], [0.0001,0.0000,0.0000],
        [0.0001,0.0000,0.0000], [0.0001,0.0000,0.0000], [0.0000,0.0000,0.0000]
    ];

    for (i = 0, lambda = 380; lambda < 780.1; i++, lambda += 5) {
        var Me;

        Me = spec_intens(lambda);
        X += Me * cie_colour_match[i][0];
        Y += Me * cie_colour_match[i][1];
        Z += Me * cie_colour_match[i][2];
    }
    XYZ = (X + Y + Z);
    x.val = X / XYZ;
    y.val = Y / XYZ;
    z.val = Z / XYZ;
}

var bbTemp = 5000;

function bb_spectrum(wavelength){
    var wlm = wavelength * 1e-9;

    return (3.74183e-16 * Math.pow(wlm, -5.0)) /
        (Math.exp(1.4388e-2 / (wlm * bbTemp)) - 1.0);
}

function temperature_to_rgb(lambda){
    var t;
    var x,y,z,r,g,b;
    x = {val:0};
    y = {val:0};
    z = {val:0};
    r = {val:0};
    g = {val:0};
    b = {val:0};


    var cs = SMPTEsystem;

    bbTemp = lambda;
    spectrum_to_xyz(bb_spectrum, x, y, z);
    xyz_to_rgb(cs, x.val, y.val, z.val, r, g, b);

    if (constrain_rgb(r, g, b)) {
        norm_rgb(r, g, b);
        return {r: r.val, g: g.val, b:b.val, approx:true};
    } else {
        norm_rgb(r, g, b);
        return {r: r.val, g: g.val, b:b.val, approx:false};
    }
}
