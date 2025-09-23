# Testing and CI/CD Documentation

## Overview
This document describes the testing strategy and CI/CD pipeline for the Sehat Saathi child health application.

## Testing Strategy

### Test Types
1. **Unit Tests** - Test individual components and services
2. **Integration Tests** - Test component interactions
3. **Smoke Tests** - Basic functionality verification
4. **Performance Tests** - Lighthouse CI for web vitals

### Test Tools
- **Vitest** - Unit and integration testing framework
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Extended matchers
- **@vitest/coverage-v8** - Code coverage reporting

### Running Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Coverage Goals
- **Minimum coverage**: 70%
- **Critical paths**: 90%
- **Services**: 85%
- **Components**: 75%

## CI/CD Pipeline

### Workflow Triggers
- **Push** to `main` or `develop` branches
- **Pull Requests** to `main` or `develop` branches

### Pipeline Stages

#### 1. Test Stage
- Runs on Node.js 20.19.0 and 22.12.0
- Executes linting (`npm run lint`)
- Runs test suite with coverage
- Uploads coverage to Codecov

#### 2. Build Stage
- Builds production application
- Uploads build artifacts
- Validates build integrity

#### 3. Security Scan Stage
- Runs `npm audit` for vulnerability detection
- Checks dependencies with `depcheck`
- Ensures security compliance

#### 4. Deploy Stage

##### Staging Deployment
- **Trigger**: Push to `develop` branch
- **Environment**: https://sehat-saathi-staging.netlify.app
- **Purpose**: Feature testing and validation

##### Production Deployment
- **Trigger**: Push to `main` branch
- **Environment**: https://sehat-saathi.netlify.app
- **Purpose**: Live application

#### 5. Performance Testing
- Runs Lighthouse CI on staging
- Measures Core Web Vitals
- Ensures performance standards

### Environment Variables Required

#### GitHub Secrets
```
NETLIFY_AUTH_TOKEN          # Netlify deployment token
NETLIFY_STAGING_SITE_ID     # Staging site identifier
NETLIFY_PRODUCTION_SITE_ID  # Production site identifier
LHCI_GITHUB_APP_TOKEN       # Lighthouse CI token
```

#### Application Environment Variables
```
VITE_ESIGNET_URL           # eSignet service endpoint
VITE_ESIGNET_CLIENT_ID     # eSignet client identifier
VITE_API_BASE_URL          # Backend API base URL
```

## Development Workflow

### Branch Strategy
- **main** - Production-ready code
- **develop** - Integration branch for features
- **feature/** - Individual feature branches

### Quality Gates
1. All tests must pass
2. Code coverage > 70%
3. Security audit passes
4. Build succeeds
5. Lighthouse scores meet thresholds

### Performance Thresholds
- **Performance**: ≥ 80
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 80
- **SEO**: ≥ 80
- **PWA**: ≥ 70

## Monitoring and Alerting

### Build Notifications
- GitHub commit status checks
- Pull request build status
- Deployment notifications

### Performance Monitoring
- Lighthouse CI reports
- Web vitals tracking
- Performance budgets

## Troubleshooting

### Common Issues

#### Test Failures
1. Check mocked services are properly configured
2. Verify localStorage/sessionStorage mocks
3. Ensure async operations are properly awaited

#### Build Failures
1. Check Node.js version compatibility
2. Verify all dependencies are installed
3. Check for syntax errors

#### Deployment Failures
1. Verify Netlify configuration
2. Check environment variables
3. Validate build artifacts

### Debug Commands

```bash
# Debug test failures
npm run test -- --reporter=verbose

# Debug build issues
npm run build -- --debug

# Check dependency issues
npm audit
npx depcheck
```

## Best Practices

### Testing
- Write tests for all new features
- Maintain high coverage on critical paths
- Use descriptive test names
- Mock external dependencies

### CI/CD
- Keep pipelines fast (< 10 minutes)
- Fail fast on critical issues
- Use caching for dependencies
- Monitor pipeline performance

### Security
- Regular dependency updates
- Security audit automation
- Environment variable protection
- Access control for deployments

## Future Enhancements

### Planned Improvements
- End-to-end testing with Playwright
- Visual regression testing
- Container-based deployments
- Multi-environment support
- Advanced monitoring integration

### Performance Optimizations
- Bundle size monitoring
- Code splitting strategies
- Service worker optimization
- CDN integration