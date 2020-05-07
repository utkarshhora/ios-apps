//
//  ViewController.swift
//  Quizzler
//
//  Created by Angela Yu on 25/08/2015.
//  Copyright (c) 2015 London App Brewery. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
    
    //Place your instance variables here
    
    let questions = QuestionBank()
    var pickedAns: Bool = true
    var questionNum: Int = 0
    var score: Float = 0

    @IBOutlet weak var questionLabel: UILabel!
    @IBOutlet weak var scoreLabel: UILabel!
    @IBOutlet var progressBar: UIView!
    @IBOutlet weak var progressLabel: UILabel!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        questionLabel.text = questions.list[0].questionText
        scoreLabel.text = String(score)
        progressLabel.text = "1/\(questions.list.count)"
    }


    @IBAction func answerPressed(_ sender: AnyObject) {
        if sender.tag == 1{
            pickedAns = true
        }
        else{
            pickedAns = false
        }
        checkAnswer()
        nextQuestion()
    }
    
    
    func updateUI() {
        
        questionLabel.text = questions.list[questionNum].questionText
        scoreLabel.text = "Score: \(score)"
        progressLabel.text = "\(questionNum+1)/\(questions.list.count)"
        let divisions = Float(view.frame.width)/Float(questions.list.count)
        progressBar.frame.size.width += CGFloat(divisions)
        
    }
    

    func nextQuestion() {
        if questionNum >= questions.list.count{
            let restartAction = UIAlertAction(title: "Restart", style: .default) { (UIAlertAction) in
                self.startOver()
            }
            let alert = UIAlertController(title: "Quiz Over", message: "Would you like to start again", preferredStyle: .alert )
            //startOver()
            
            alert.addAction(restartAction)
            present(alert, animated: true)
        }
        
        else{
            updateUI()
        }
    }
    
    
    func checkAnswer() {
        let correctAns = questions.list[questionNum].answer
        if correctAns == pickedAns{
            score += 1
            ProgressHUD.showSuccess("Correct!")
        }
        else{
            ProgressHUD.showError("Wrong!")
        }
        
        questionNum += 1
        
    }
    
    
    func startOver() {
       questionNum = 0
       score = 0
       updateUI()
       progressBar.frame.size.width = 30
    }
    

    
}
