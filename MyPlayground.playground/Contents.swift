//: Playground - noun: a place where people can play

import UIKit

func fibo(_ n: Int) -> Int{
    
    if n <= 1{
        return n
    }
    else{
        return fibo(n-1) + fibo(n-2)
    }
}

print(fibo(9))
