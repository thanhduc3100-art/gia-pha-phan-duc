/* Thuật toán Âm Lịch Việt Nam - Nguyên tác: TS. Hồ Ngọc Đức */
function INT(d){return Math.floor(d);}
function jdn(dd,mm,yyyy){
    var a=INT((14-mm)/12); var y=yyyy+4800-a; var m=mm+12*a-3;
    var jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-INT(y/100)+INT(y/400)-32045;
    if(jd<2299161){jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-32083;}
    return jd;
}
function jdToDate(jd){
    var a,b,c,d,e,m,day,month,year;
    if(jd>2299160){a=jd+32044; b=INT((4*a+3)/146097); c=a-INT((146097*b)/4); d=INT((4*c+3)/1461); e=c-INT((1461*d)/4); m=INT((5*e+2)/153); day=e-INT((153*m+2)/5)+1; month=m+3-12*INT(m/10); year=100*b+d-4800+INT(m/10);}
    else{b=jd+32082; c=INT((4*b+3)/1461); d=b-INT((1461*c)/4); e=INT((5*d+2)/153); day=d-INT((153*e+2)/5)+1; month=e+3-12*INT(e/10); year=c-4800+INT(e/10);}
    return [day,month,year];
}
function getNewMoonDay(k,timeZone){
    var T=k/1236.85; var T2=T*T; var T3=T2*T; var dr=Math.PI/180;
    var Jd=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3+0.00033*Math.sin((166.56+132.87*T-0.009173*T2)*dr);
    var M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3;
    var Mprime=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3;
    var F=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3;
    var C=(0.1734-0.000393*T)*Math.sin(M*dr)+0.0021*Math.sin(2*M*dr)-0.0004*Math.sin(Mprime*dr)+0.0005*Math.sin(2*F*dr);
    var deltat=0.0014*Math.sin((0.003964*k+1.12433)*dr);
    return INT(Jd+C+deltat+0.5+timeZone/24);
}
function getSunLongitude(dayNumber,timeZone){
    var T=(dayNumber-2451545.0-timeZone/24)/36525.0; var T2=T*T; var dr=Math.PI/180;
    var L=280.46646+36000.76983*T+0.0003032*T2;
    var M=357.52911+35999.05029*T-0.0001537*T2;
    var C=(1.914602-0.004817*T-0.000014*T2)*Math.sin(M*dr)+(0.019993-0.000101*T)*Math.sin(2*M*dr)+0.000289*Math.sin(3*M*dr);
    var Ltrue=L+C;
    var omega=125.04-1934.136*T;
    var lambda=Ltrue-0.00569-0.00478*Math.sin(omega*dr);
    return Math.floor((lambda%360)/30);
}
function getLunarMonth11(yy,timeZone){
    var off=jdToDate(jdn(31,12,yy))[0]===31?0:-1;
    var k=INT((jdn(31,12,yy)-2415021.076998695)/29.530588853)+off;
    var nm=getNewMoonDay(k,timeZone);
    while(nm>jdn(31,12,yy)){nm=getNewMoonDay(--k,timeZone);}
    return nm;
}
function getLeapMonthOffset(a11,timeZone){
    var k=INT((a11-2415021.076998695)/29.530588853)+0.5;
    var last=0; var arc=getSunLongitude(getNewMoonDay(k,timeZone),timeZone);
    for(var i=1;i<=13;i++){
        var NewMoon=getNewMoonDay(k+i,timeZone);
        var arc_next=getSunLongitude(NewMoon,timeZone);
        if(arc===arc_next){last=i;break;} arc=arc_next;
    }
    return last;
}
function getLunarDate(dd,mm,yyyy,timeZone){
    var jd=jdn(dd,mm,yyyy); var a11=getLunarMonth11(yyyy-1,timeZone);
    var b11=getLunarMonth11(yyyy,timeZone); var k=INT((jd-a11)/29.530588853);
    var nm=getNewMoonDay(k,timeZone);
    if(nm>jd) nm=getNewMoonDay(--k,timeZone);
    var a11_b11=INT((b11-a11)/29); var month=k-1;
    if(a11_b11===13){var leapMonth=getLeapMonthOffset(a11,timeZone); if(k>leapMonth) month=k-2;}
    if(month<1) month+=12;
    return [jd-nm+1,month,yyyy+(month<11?0:-1)];
}
function getSolarDate(lunarDay,lunarMonth,lunarYear,lunarLeap,timeZone){
    var a11=getLunarMonth11(lunarYear-1,timeZone); var b11=getLunarMonth11(lunarYear,timeZone);
    var month=lunarMonth<11?lunarMonth+12:lunarMonth; var k=month-11;
    if(INT((b11-a11)/29)===13){
        var leapMonth=getLeapMonthOffset(a11,timeZone);
        var leapMonth1=(leapMonth-1)%12+1;
        if(lunarLeap===1||month>leapMonth1) k++;
    }
    var jd=getNewMoonDay(INT((a11-2415021.076998695)/29.530588853)+0.5+k,timeZone)+lunarDay-1;
    return jdToDate(jd);
}
