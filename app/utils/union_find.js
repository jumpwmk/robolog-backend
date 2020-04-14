// PriorityQueue class 
class UnionFind { 
  
    // An array is used to implement priority 
    constructor(n) 
    { 
        this.roots = new Array(n + 1).fill(0); 
        this.ranks = new Array(n + 1).fill(0); 
        for(var i = 0; i <= n; i++){
            this.roots[i] = i;
        }
    } 
  
    // functions to be implemented 
    // find head
    find(element) 
    { 
        var tmp = element;
        var roots = this.roots;
        while(roots[tmp] !== tmp) {
            tmp = roots[tmp];
        }
        while(roots[element] !== tmp) {
            var tmp2 = roots[element];
            roots[element] = tmp;
            element = tmp2;
        }
        return tmp;
    } 
    // union() 
    union(x, y) 
    { 
        var xr = this.find(x), yr = this.find(y);
        if(xr === yr) {
            return;
        }
        var ranks = this.ranks, roots = this.roots, xd = ranks[xr], yd = ranks[yr];
        if(xd < yd) {
            roots[xr] = yr;
        } 
        else if(yd < xd) {
            roots[yr] = xr;
        } 
        else {
            roots[yr] = xr;
            ++ranks[xr];
        }
    } 
} 

exports.UnionFind = UnionFind;