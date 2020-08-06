/**
 * 
 * @param {array} route 路线
 * @param {number} timespan 花费时间
 * @param {string} type 交通类型,可选值： driving、walking、bicycling、bus、subway、rail
 * @param {boolean} mask 是否戴口罩 
 * @param {number} money 费用 
 */

function direction(route,timespan,type,mask,money){
    var s;//定义交通工具社交距离常量s
    if(type == "driving"){s=5;}
    if(type == "bicycling"){s=10;} 
    if(type == "bus"){s=7;} 
    if(type == "subway"){s=5;} 
    if(type == "rail"){s=2;} //根据交通方式的不同改变社交距离常量
    var s0 = 20;//定义步行社交距离常量s0
    var t = timespan;//定义时间t
    var S,t1,t2;//定义总社交距离S，起点到上车点的时间t1，下车点到终点的时间t2
    var M = money;//定义金钱M
    var C1 = 1,C2 = 1,C3 = 1,C4 = 1,C5 = 1,C6 = 1; /* 权重没有对应的形参,暂且简单的定义为常数，可以再加参数来传进来 */
    var k = 50;//定义戴口罩方案中的常量K
    
    if(mask)//根据是否戴口罩选择两种计算方式
    {
        S = C1*(s+k)/(C2*t) ;
        return S;
    }
    else
    {
        S = C1*s/(C2*T+C3*M)+ C4*s0/(C5*T1+C6*T2);
        return S;
    }

    
    return 1;}

module.exports = {
    direction: direction
};