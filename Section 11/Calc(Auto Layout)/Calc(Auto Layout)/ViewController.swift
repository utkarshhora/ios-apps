//
//  ViewController.swift
//  Calc(Auto Layout)
//
//  Created by Utkarsh on 30/07/18.
//  Copyright © 2018 Utkarsh. All rights reserved.
//
/*Tags:
0 = 0
1 = 1
2 = 2
... 9 = 9
'.' = 10
C = 11
+/- = 12
% = 13
/ = 14
* = 15
- = 16
+ = 17
'=' = 18
 */

import UIKit

class ViewController: UIViewController {

    @IBOutlet weak var opBox: UILabel!
    @IBOutlet weak var numBox: UILabel!
    var textFinal1: String = ""
    var textFinal2: String = ""
    var numFinal1: Double = 0
    var numFinal2: Double = 0
    var ansFinal: Double = 0
    let tagToKey = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "C", "+-", "%", "/", "*", "-", "+", "="]
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        numBox.text = "0"
        opBox.text = ""
        UIApplication.shared.statusBarStyle = .lightContent
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    
    
    @IBAction func calcButton(_ sender: UIButton) {
        if "0123456789".range(of: String(sender.tag)) != nil && sender.tag != 12 {
            numInput(tagToKey[sender.tag])
         }
        
        else if "13 14 15 16 17".range(of: String(sender.tag)) != nil{
            opInput(tagToKey[sender.tag])
        }
        
        else if sender.tag == 18{
            calculate()
        }
        
        else if sender.tag == 11{
            clear()
        }
        
    }
    
    
    
    func updateUI(_ num: String, _ op: String){
        numBox.text = num
        opBox.text = op
    }
    
    
    
    func numInput(_ numString: String){
        
        if opBox.text != ""{
            textFinal1 += numString
            numFinal1 = Double(textFinal1)!
            updateUI(textFinal1, opBox.text!)
        }
        else{
            textFinal2 += numString
            numFinal2 = Double(numString)!
            updateUI(textFinal2, opBox.text!)

        }
        
    }
    
    
    
    func opInput(_ opString: String){
        updateUI(numBox.text!, opString)
    }
    
    
    func calculate(){
        switch opBox.text {
        case "+":
            ansFinal = numFinal1 + numFinal2
        case "-":
            ansFinal = numFinal1 - numFinal2
        case "*":
            ansFinal = numFinal1 * numFinal2
        case "/":
            ansFinal = numFinal1 / numFinal2
        case "%":
            ansFinal = (numFinal1/100) * numFinal2
        case "+-":
            ansFinal = -1 * ansFinal
        case "//":
            ansFinal = numFinal1 / numFinal2
        default:
            ansFinal = 0
        }
        
        reset()
        updateUI(String(ansFinal), "")
    }
    
    
    func clear(){
        reset()
        updateUI("0", "")
    }
    
    
    func reset(){
        textFinal1 = String(ansFinal)
        textFinal2 = ""
        numFinal1 = ansFinal
        numFinal2 = 0
    
    }
}

