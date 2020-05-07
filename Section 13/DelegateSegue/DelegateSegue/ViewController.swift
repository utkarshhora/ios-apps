//
//  ViewController.swift
//  DelegateSegue
//
//  Created by Utkarsh on 06/08/18.
//  Copyright © 2018 Utkarsh. All rights reserved.
//

import UIKit

class ViewController: UIViewController, SecondViewDelegate {

    @IBOutlet weak var textField: UITextField!
    @IBOutlet weak var label1: UILabel!
    var dataBack = " "
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        label1.text = dataBack
    }



    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        if segue.identifier == "ViewChange1"{
            let secondVC = segue.destination as! SecondViewController
            secondVC.data = textField.text!
            secondVC.delegate = self
        }
    }

    func dataReceived(text: String) {
        label1.text = text
    }
}

