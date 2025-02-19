pipeline {
    agent any
    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    sh('npm install')  // This installs the required dependencies using npm
                }
            }
        }
        stage('Unit Test') {
            steps {
                script {
                    sh('npm test')  // This runs your unit tests with npm
                }
            }
        }
        stage('Build Application') {
            steps {
                script {
                    sh('npm run build-dev')  // This builds your application for the development environment
                }
            }
        }
    }
}
