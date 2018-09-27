pipeline {
  agent none

  stages {
    stage('Prepare') {
      parallel {
        stage('Test') {
          steps {
            echo "♻️ Running test suites"
          }
        }

        stage ('Build') {
          steps {
            echo "🛠 Building Docker image"
          }
        }
      }
    }

    stage ('Publish') {
      when {
        branch 'master'
      }

      steps {
        echo "📦 Publishing to NPM"
      }
    }

    stage ('Deploy') {
      when {
        branch 'master'
      }

      steps {
        echo "🌎 Deploying to Production"
      }
    }
  }
}
