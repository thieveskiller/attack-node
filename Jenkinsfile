pipeline {
    agent any
    
    stages {
        stage('Checking git') {
            steps {
                scmSkip(deleteBuild: true)
            }
        }
        stage('Test') {
            steps {
                sh 'node test.js'
            }
        }
    }
}
