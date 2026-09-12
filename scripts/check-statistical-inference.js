import assert from "node:assert/strict";
import { confidenceIntervalKnownSigma, distributionStandardDeviation, distributionVariance, expectedValue, normalCdf, sampleMeanStandardError, standardize, zTestMean } from "../static/atlas/math/statistical-inference.js";
assert.equal(expectedValue([0, 1], [.5, .5]), .5); assert.equal(distributionVariance([0, 1], [.5, .5]), .25); assert.equal(distributionStandardDeviation([0, 1], [.5, .5]), .5);
assert.ok(Math.abs(normalCdf(0) - .5) < 1e-6); assert.ok(Math.abs(normalCdf(1.96) - .975) < 0.002); assert.equal(standardize(70, 50, 10), 2); assert.equal(sampleMeanStandardError(12, 36), 2);
const interval = confidenceIntervalKnownSigma({ sampleMean: 50, populationSd: 10, sampleSize: 100, confidence: .95 }); assert.ok(Math.abs(interval.margin - 1.9599639845) < 1e-6);
assert.ok(Math.abs(zTestMean({ sampleMean: 54, nullMean: 50, populationSd: 10, sampleSize: 25 }).z - 2) < 1e-10);
console.log("Statistical inference: PASS (distribution, normal, standardization, CI and z-test)");
