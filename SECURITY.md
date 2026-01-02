# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in J3D Frontend, **please do NOT open a public issue**. Instead:

1. **Email**: Send a detailed report to the project maintainer with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if applicable)

2. **Response Timeline**: We will acknowledge receipt within 48 hours and provide an estimated fix timeline

3. **Responsible Disclosure**: Please allow 30 days for a fix before any public disclosure

## Supported Versions

| Version | Status | Security Updates |
|---------|--------|------------------|
| 2.0.x   | Active | Yes              |
| 1.x.x   | EOL    | No               |

Only the latest minor version receives security updates.

## Security Practices

### Authentication & Authorization
- OAuth 2.0 integration with Etsy API for user authentication
- JWT tokens stored securely in httpOnly cookies (not accessible to JavaScript)
- Auth guards on all protected routes
- Session timeouts enforced server-side

### Data Protection
- HTTPS enforced in production (via nginx)
- Content Security Policy (CSP) headers configured
- X-Frame-Options set to prevent clickjacking
- HSTS (HTTP Strict-Transport-Security) enabled
- No sensitive data stored in localStorage

### API Communication
- All API calls proxied through nginx in production
- Environment-based API URL configuration (never hardcoded)
- Development and production configurations separated
- CORS properly configured on backend

### Dependencies
- Regular npm dependency updates via `npm audit`
- Angular framework kept up-to-date
- Angular Material security patches applied
- Automated dependency scanning in CI/CD

### Code Security
- No hardcoded credentials or secrets
- Environment variables used for sensitive configuration
- `.env` files excluded from git via `.gitignore`
- TypeScript strict mode enabled for type safety
- Angular security guidelines followed

### Container Security
- Non-root user runs the nginx container
- Multi-stage Docker builds for minimal image size
- Read-only filesystem where possible
- Container health checks enabled

### Development Security
- Code review process for all changes
- Automated security scanning in GitHub Actions
- Dependency vulnerability scanning
- Container image scanning for vulnerabilities

## Known Security Considerations

1. **OAuth Token Refresh**: Ensure backend securely refreshes Etsy OAuth tokens
2. **API Rate Limiting**: Implement rate limiting on backend for brute-force protection
3. **Session Security**: Monitor for session fixation vulnerabilities
4. **Input Validation**: All user inputs should be validated on both frontend and backend

## Security Recommendations for Deployment

### Environment Variables
Set these securely in your deployment environment:
```
VITE_API_URL=https://your-api-domain.com  # Production API URL
```

### HTTPS/TLS
- Always use HTTPS in production
- Use valid SSL/TLS certificates (Let's Encrypt recommended)
- Enforce HSTS with `max-age=31536000` or higher

### Container Deployment
- Run container with resource limits (memory, CPU)
- Use read-only root filesystem where possible
- Mount `/var/cache/nginx` and `/var/run` as tmpfs
- Do not run with elevated privileges

### Network Security
- Restrict API access to known IPs if possible
- Use private networks for backend communication
- Implement DDoS protection (Cloudflare, AWS Shield, etc.)
- Monitor for suspicious access patterns

## Security Headers

The application sets the following headers via nginx:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Incident Response

If a security vulnerability is discovered:

1. **Immediate**: Patch is developed and tested
2. **Within 7 days**: Security release published
3. **Communication**: Security advisory issued to users
4. **Follow-up**: Post-incident analysis and improvements

## Security Checklist for Production

- [ ] HTTPS/TLS configured with valid certificates
- [ ] Environment variables set securely (never in git)
- [ ] .env file excluded from deployment
- [ ] CORS properly configured for your domain
- [ ] API rate limiting enabled
- [ ] Container runs as non-root user
- [ ] Regular dependency updates scheduled
- [ ] Security headers verified in browser
- [ ] CSP policy tested thoroughly
- [ ] Monitoring and logging enabled

## Contact

For security concerns, contact the project maintainer directly rather than using issue trackers.

---

**Last Updated**: January 2, 2026
