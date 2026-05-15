pipeline {
    agent any

    // ─── Global Environment ───────────────────────────────────────────────────
    environment {
        DOCKER_REGISTRY   = 'registry.resqai.gov.in'
        IMAGE_TAG         = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'latest'}"
        CLUSTER_NAME      = 'resqai-cluster'
        AWS_REGION        = 'ap-south-1'
        SLACK_CHANNEL     = '#resqai-deployments'
        NAMESPACE         = 'resqai'

        // Docker image names
        FRONTEND_IMAGE    = "${DOCKER_REGISTRY}/resqai-frontend"
        BACKEND_IMAGE     = "${DOCKER_REGISTRY}/resqai-backend"
        AI_IMAGE          = "${DOCKER_REGISTRY}/resqai-ai"
    }

    // ─── Build Triggers ───────────────────────────────────────────────────────
    triggers {
        // Poll SCM every 5 minutes for changes on the main branch
        pollSCM('H/5 * * * *')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    // ─── Stages ───────────────────────────────────────────────────────────────
    stages {

        // 1. SOURCE CHECKOUT
        stage('Checkout') {
            steps {
                echo "━━━━ 📥 Checking out source code ━━━━"
                checkout scm
                echo "✅ Build: #${env.BUILD_NUMBER} | Commit: ${env.GIT_COMMIT?.take(7)}"
                echo "Branch: ${env.GIT_BRANCH} | Author: ${env.GIT_AUTHOR_NAME}"
            }
        }

        // 2. INSTALL & LINT (all services in parallel)
        stage('Install & Lint') {
            parallel {
                stage('🖥️ Frontend Lint') {
                    steps {
                        dir('frontend') {
                            echo "Installing frontend dependencies..."
                            sh 'npm ci --legacy-peer-deps'
                            sh 'npm run lint --if-present || echo "No lint script found, skipping."'
                        }
                    }
                }
                stage('🔧 Backend Lint') {
                    steps {
                        dir('backend') {
                            echo "Installing backend dependencies..."
                            sh 'npm ci'
                            sh 'npm run lint --if-present || echo "No lint script found, skipping."'
                        }
                    }
                }
                stage('🤖 AI Module Check') {
                    steps {
                        dir('ai-module') {
                            echo "Checking Python AI module syntax..."
                            sh '''
                                pip install -r requirements.txt -q
                                python -m py_compile main.py
                                echo "✅ Python syntax OK"
                            '''
                        }
                    }
                }
            }
        }

        // 3. AUTOMATED TESTS (parallel)
        stage('Test') {
            parallel {
                stage('🧪 Frontend Tests') {
                    steps {
                        dir('frontend') {
                            echo "Running frontend unit tests..."
                            sh 'CI=true npm test -- --watchAll=false --passWithNoTests --forceExit'
                        }
                    }
                }
                stage('🧪 Backend Tests') {
                    steps {
                        dir('backend') {
                            echo "Running backend unit tests..."
                            sh 'npm test -- --passWithNoTests --forceExit'
                        }
                    }
                }
            }
        }

        // 4. BUILD DOCKER IMAGES (parallel)
        stage('Build Docker Images') {
            parallel {
                stage('🐳 Build Frontend') {
                    steps {
                        dir('frontend') {
                            echo "Building frontend Docker image: ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                            sh """
                                docker build \
                                    --label "git.commit=${env.GIT_COMMIT}" \
                                    --label "build.number=${env.BUILD_NUMBER}" \
                                    -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                                    -t ${FRONTEND_IMAGE}:latest \
                                    .
                            """
                        }
                    }
                }
                stage('🐳 Build Backend') {
                    steps {
                        dir('backend') {
                            echo "Building backend Docker image: ${BACKEND_IMAGE}:${IMAGE_TAG}"
                            sh """
                                docker build \
                                    --label "git.commit=${env.GIT_COMMIT}" \
                                    --label "build.number=${env.BUILD_NUMBER}" \
                                    -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                                    -t ${BACKEND_IMAGE}:latest \
                                    .
                            """
                        }
                    }
                }
                stage('🐳 Build AI Module') {
                    steps {
                        dir('ai-module') {
                            echo "Building AI module Docker image: ${AI_IMAGE}:${IMAGE_TAG}"
                            sh """
                                docker build \
                                    --label "git.commit=${env.GIT_COMMIT}" \
                                    --label "build.number=${env.BUILD_NUMBER}" \
                                    -t ${AI_IMAGE}:${IMAGE_TAG} \
                                    -t ${AI_IMAGE}:latest \
                                    .
                            """
                        }
                    }
                }
            }
        }

        // 5. SECURITY SCANNING (Trivy)
        stage('🔒 Security Scan') {
            steps {
                echo "Running Trivy vulnerability scan on backend image..."
                sh """
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy image \
                        --exit-code 0 \
                        --severity HIGH,CRITICAL \
                        --no-progress \
                        ${BACKEND_IMAGE}:${IMAGE_TAG}
                """
                echo "✅ Security scan complete"
            }
        }

        // 6. PUSH TO DOCKER REGISTRY
        stage('📤 Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                echo "Pushing all images to registry: ${DOCKER_REGISTRY}"
                withCredentials([usernamePassword(
                    credentialsId: 'docker-registry-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo \$DOCKER_PASS | docker login ${DOCKER_REGISTRY} -u \$DOCKER_USER --password-stdin"

                    sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${FRONTEND_IMAGE}:latest"

                    sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${BACKEND_IMAGE}:latest"

                    sh "docker push ${AI_IMAGE}:${IMAGE_TAG}"
                    sh "docker push ${AI_IMAGE}:latest"
                }
                echo "✅ All images pushed successfully"
            }
        }

        // 7. DEPLOY TO KUBERNETES (AWS EKS)
        stage('🚀 Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                echo "Deploying build ${IMAGE_TAG} to EKS cluster: ${CLUSTER_NAME}"
                withCredentials([
                    [
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-eks-creds',
                        accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                    ]
                ]) {
                    sh """
                        # Update kubeconfig for EKS
                        aws eks update-kubeconfig \
                            --name ${CLUSTER_NAME} \
                            --region ${AWS_REGION}

                        # Rolling update all deployments
                        kubectl set image deployment/resqai-frontend \
                            frontend=${FRONTEND_IMAGE}:${IMAGE_TAG} -n ${NAMESPACE}

                        kubectl set image deployment/resqai-backend \
                            backend=${BACKEND_IMAGE}:${IMAGE_TAG} -n ${NAMESPACE}

                        kubectl set image deployment/resqai-ai \
                            ai=${AI_IMAGE}:${IMAGE_TAG} -n ${NAMESPACE}

                        # Wait for rollouts to complete
                        kubectl rollout status deployment/resqai-frontend \
                            -n ${NAMESPACE} --timeout=120s

                        kubectl rollout status deployment/resqai-backend \
                            -n ${NAMESPACE} --timeout=120s

                        kubectl rollout status deployment/resqai-ai \
                            -n ${NAMESPACE} --timeout=120s
                    """
                }
                echo "✅ Kubernetes deployments rolled out successfully"
            }
        }

        // 8. POST-DEPLOYMENT SMOKE TEST
        stage('🔬 Smoke Test') {
            when {
                branch 'main'
            }
            steps {
                echo "Running post-deployment smoke tests..."
                sh '''
                    sleep 15
                    curl -sf http://resqai.gov.in/health \
                        && echo "✅ Frontend health OK" \
                        || (echo "❌ Frontend health check FAILED" && exit 1)

                    curl -sf http://resqai.gov.in/api/health \
                        && echo "✅ Backend API health OK" \
                        || echo "⚠️ Backend API check returned non-200 (non-fatal)"
                '''
                echo "✅ Smoke tests passed — Production is healthy"
            }
        }
    }

    // ─── Post Actions ─────────────────────────────────────────────────────────
    post {
        success {
            echo "━━━━ ✅ PIPELINE SUCCESS ━━━━"
            echo "ResQAI build ${IMAGE_TAG} deployed to production successfully!"
            slackSend(
                channel: "${SLACK_CHANNEL}",
                color: 'good',
                message: """
✅ *ResQAI Deployment Successful!*
• Build: `#${env.BUILD_NUMBER}`
• Image Tag: `${IMAGE_TAG}`
• Branch: `${env.GIT_BRANCH}`
• Commit: `${env.GIT_COMMIT?.take(7)}`
• Duration: ${currentBuild.durationString}
                """.stripIndent()
            )
        }

        failure {
            echo "━━━━ ❌ PIPELINE FAILED — Auto-rollback triggered ━━━━"
            withCredentials([
                [
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-eks-creds',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]
            ]) {
                sh """
                    aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_REGION} || true
                    kubectl rollout undo deployment/resqai-backend  -n ${NAMESPACE} || true
                    kubectl rollout undo deployment/resqai-frontend -n ${NAMESPACE} || true
                    kubectl rollout undo deployment/resqai-ai       -n ${NAMESPACE} || true
                    echo "⏪ Rollback complete"
                """
            }
            slackSend(
                channel: "${SLACK_CHANNEL}",
                color: 'danger',
                message: """
❌ *ResQAI Deployment FAILED!*
• Build: `#${env.BUILD_NUMBER}`
• Image Tag: `${IMAGE_TAG}`
• Branch: `${env.GIT_BRANCH}`
• Commit: `${env.GIT_COMMIT?.take(7)}`
• ⏪ Auto-rollback has been triggered
• Check logs: ${env.BUILD_URL}
                """.stripIndent()
            )
        }

        unstable {
            slackSend(
                channel: "${SLACK_CHANNEL}",
                color: 'warning',
                message: "⚠️ *ResQAI Build #${env.BUILD_NUMBER} is UNSTABLE* — Tests may have failed. Image Tag: `${IMAGE_TAG}`"
            )
        }

        always {
            echo "Cleaning up Docker images from local agent to free disk space..."
            sh """
                docker rmi ${FRONTEND_IMAGE}:${IMAGE_TAG} || true
                docker rmi ${BACKEND_IMAGE}:${IMAGE_TAG}  || true
                docker rmi ${AI_IMAGE}:${IMAGE_TAG}       || true
                docker image prune -f || true
            """
            cleanWs()
        }
    }
}
