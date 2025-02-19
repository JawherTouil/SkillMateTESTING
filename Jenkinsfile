pipeline {
    agent any
    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    sh('npm install')
                }
            }
        }
        stage('Unit Test') {
            steps {
                script {
                    sh('npm test')
                }
            }
        }
        stage('Build Application') {
            steps {
                script {
                    sh('npm run build-dev')
                }
            }
        }
    }
}

