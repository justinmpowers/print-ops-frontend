pipeline {
    agent any
    
    environment {
        REGISTRY = 'ghcr.io'
        IMAGE_NAME = 'justinmpowers/j3d-frontend'
    }
    
    options {
        // Only keep last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    
    triggers {
        // Trigger on GitHub push events via webhook
        // Pipeline will trigger for all branches; branch-specific logic is handled in stages
        githubPush()
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Extract Version') {
            steps {
                script {
                    if (!fileExists('VERSION')) {
                        error "VERSION file not found in workspace. Cannot continue."
                    }

                    def version = readFile('VERSION').trim()

                    if (!version) {
                        error "VERSION file is empty or whitespace only. Cannot continue."
                    }

                    // Basic version format validation following semantic versioning (e.g., 1.2.3, 1.2.3-rc1, 1.2.3+build)
                    if (!(version ==~ /\d+\.\d+\.\d+(-[0-9A-Za-z]+(\.[0-9A-Za-z]+)*)?(\+[0-9A-Za-z]+(\.[0-9A-Za-z]+)*)?/)) {
                        error "VERSION '${version}' does not match semantic versioning format (e.g., 1.2.3, 1.2.3-rc1, 1.2.3+build)."
                    }

                    env.VERSION = version
                    echo "Building version: ${env.VERSION}"
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    // Credentials 'github-container-registry' must be configured in Jenkins
                    // with GitHub Personal Access Token (PAT) that has write:packages scope
                    docker.withRegistry("https://${env.REGISTRY}", 'github-container-registry') {
                        def customImage = docker.build(
                            "${env.REGISTRY}/${env.IMAGE_NAME}:${env.VERSION}",
                            "--build-arg VERSION=${env.VERSION} ."
                        )
                        customImage.push()
                        
                        // Only push 'latest' tag when building from main branch
                        if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                            customImage.push('latest')
                        } else {
                            echo "Skipping 'latest' tag push for branch ${env.BRANCH_NAME}"
                        }
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "Successfully built and pushed ${env.IMAGE_NAME}:${env.VERSION}"
        }
        failure {
            echo "Build failed for ${env.IMAGE_NAME}"
        }
        always {
            cleanWs()
        }
    }
}
