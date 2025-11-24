# AMP CDN Deployment Checklist

## Pre-Deployment Phase

### Configuration
- [ ] Add CDN endpoints to `.env.local`
  ```
  CDN_US_PRIMARY=
  CDN_US_SECONDARY=
  CDN_EU_PRIMARY=
  CDN_EU_SECONDARY=
  CDN_APAC_PRIMARY=
  CDN_APAC_SECONDARY=
  AMP_CACHE_ENABLED=true
  ```
- [ ] Verify configuration: `npm run verify-amp`
- [ ] Test build locally: `npm run build`
- [ ] Review `AMP_CDN_QUICKSTART.md`

### Pages & Content
- [ ] Identify critical pages to pre-render
- [ ] Add `export const revalidate` to pages
- [ ] Add `export const dynamic = 'force-static'`
- [ ] Verify pre-render list in `next.config.ts`
- [ ] Test pre-rendering: `npm run build`

### Testing
- [ ] Test local build output
- [ ] Verify cache headers with curl/browser dev tools
- [ ] Test geolocation routing logic
- [ ] Test CDN failover manually
- [ ] Verify metrics endpoints work

## Deployment Phase

### Platform Setup (Vercel, AWS, etc.)

#### Vercel
- [ ] Set environment variables in project settings
- [ ] Enable Edge Runtime if available
- [ ] Configure cache rules
- [ ] Deploy with `git push`

#### Self-hosted
- [ ] Set environment variables in container/deployment
- [ ] Build: `npm run build`
- [ ] Start: `npm start`
- [ ] Configure reverse proxy cache headers

#### AWS/Lambda
- [ ] Set environment variables in Lambda config
- [ ] Configure CloudFront distribution
- [ ] Set up regional endpoints
- [ ] Deploy with CI/CD pipeline

### Verification
- [ ] Deployment completes successfully
- [ ] No build errors in logs
- [ ] All API endpoints accessible
- [ ] Middleware functions correctly
- [ ] Environment variables loaded

## Post-Deployment Phase

### Initial Monitoring (First 24 hours)
- [ ] Check `/api/metrics/health` every hour
- [ ] Monitor error rates
- [ ] Verify regional routing works
- [ ] Watch latency metrics
- [ ] Check cache hit ratio building up

### Performance Validation
- [ ] Cache hit ratio reaching 80%+
- [ ] Latency < 200ms in all regions
- [ ] Error rate < 1%
- [ ] No anomalies reported
- [ ] Failover tested and working

### Metrics & Analytics
- [ ] Export metrics: `/api/metrics?format=csv`
- [ ] Review per-region performance
- [ ] Check recommendations
- [ ] Analyze latency percentiles
- [ ] Document baseline metrics

## Weekly Tasks

- [ ] Review `/api/metrics` report
- [ ] Check health status
- [ ] Monitor anomaly detection
- [ ] Verify pre-render paths are working
- [ ] Update documentation if needed

## Monthly Optimization

- [ ] Review TTL effectiveness
- [ ] Analyze cache hit ratio trends
- [ ] Check if more paths should be pre-rendered
- [ ] Evaluate regional performance
- [ ] Update monitoring thresholds

## Issue Resolution

### If Cache Hit Ratio is Low (< 50%)
1. Check if pages have `export const revalidate`
2. Verify `revalidate` values are reasonable
3. Check for dynamic query parameters
4. Review `AMP_PRERENDER_PATHS` list
5. Increase TTL values
6. Add more paths to pre-render

### If Latency is High (> 500ms)
1. Verify CDN endpoint URLs
2. Check regional CDN health
3. Test secondary CDN failover
4. Check network connectivity
5. Review request size
6. Consider additional edge locations

### If Error Rate is High (> 5%)
1. Check `/api/metrics/health` for details
2. Verify CDN endpoints are online
3. Check application logs
4. Review network issues
5. Test failover mechanism
6. Contact CDN provider

### If Configuration Fails
1. Run `npm run verify-amp`
2. Check `.env.local` format
3. Verify all required files exist
4. Check file paths and imports
5. Ensure Next.js 16+ installed
6. Clear build cache: `rm -rf .next`

## Rollback Plan

If deployment causes issues:
1. Revert to previous version
2. Disable AMP cache: `AMP_CACHE_ENABLED=false`
3. Check logs for specific errors
4. Redeploy without changes
5. Contact support with error details

## Performance Targets

| Metric | Target | Action |
|--------|--------|--------|
| Cache Hit Ratio | > 80% | Increase TTL |
| Latency p50 | < 200ms | Check CDN |
| Latency p95 | < 500ms | Add locations |
| Error Rate | < 1% | Debug |

## Documentation Review

Before deployment, review:
- [ ] AMP_CDN_QUICKSTART.md
- [ ] AMP_CDN_CONFIGURATION_GUIDE.md
- [ ] AMP_CDN_IMPLEMENTATION_SUMMARY.md
- [ ] AMP_CDN_REFERENCE_CARD.md
- [ ] This file

## Sign-off

- [ ] All pre-deployment checks passed
- [ ] Team aware of new AMP CDN features
- [ ] Monitoring configured
- [ ] Support documentation reviewed
- [ ] Ready for production deployment

## Post-Deployment Sign-off

- [ ] Deployment successful
- [ ] No critical issues
- [ ] Metrics being collected
- [ ] Monitoring active
- [ ] Team trained on new features

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Verified By**: _______________
**Notes**: _______________
