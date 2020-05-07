//
//  SecondViewController.swift
//  DelegateSegue
//
//  Created by Utkarsh on 06/08/18.
//  Copyright © 2018 Utkarsh. All rights reserved.
//

import UIKit

protocol SecondViewDelegate {
    func dataReceived(text: String)
}

class SecondViewController: UIViewController {
    
    var data: String = " "
    var delegate: SecondViewDelegate?
    
    @IBOutlet weak var textField2: UITextField!
    @IBOutlet weak var label2: UILabel!
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        label2.text = data
    }



    @IBAction func button2(_ sender: Any) {
        delegate?.dataReceived(text: textField2.text!)
        dismiss(animated: true, completion: nil)

    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
