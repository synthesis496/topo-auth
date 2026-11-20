# topo-auth

> **“Errors are not corrected. They are structurally absent.”**  
> *A design principle for expressing authentication as a mathematical relation—not a claim that this prototype already provides cryptographic identity assurance.*

`topo-auth` is an experimental JavaScript prototype exploring gesture-derived geometric features and a tolerance-based comparison. Its current implementation contains three small modules: point-path calculations and transformations in `math.js`, template construction and scoring in `protocol.js`, and an initially empty `Types` export in `types.js`.

This README documents the behavior present in the repository. In particular, the current code does **not** implement a complete passwordless authentication service, a zero-knowledge proof, persistent server-side templates, challenge-response orchestration, or anti-replay controls. The mathematical concepts below describe the implemented functions and their limitations, not audited security guarantees.

## Core Philosophy

The project's guiding idea is to define responses in terms of measurable geometric properties rather than store a recording of a gesture. In the current prototype, those properties are a path length, an estimated winding value, a stroke count, and a time-field sum. `protocol.js` compares an expected invariant object with an actual one using a normalized, capped distance.

“Structural absence” is a motivating design metaphor: an implementation can define acceptance as satisfying a relation over features. It does not mean that imposters are mathematically impossible, nor does avoiding ordinary `if` statements make a verifier secure. The current code still uses JavaScript control flow for empty-key handling and fallback values, and `Math.sign()` is used only for the final strict threshold comparison.

The gesture verbs **spin, knead, reflect, throw, catch, verify** are not implemented as protocol stages in the present source. They may serve as a vocabulary for future challenge and response work; this README does not attribute those behaviors to the code.

## Mathematical Foundation

### Path length

For a sequence of points \(p_i=(x_i,y_i)\), `pathLength` sums Euclidean distances between adjacent points:

\[
L(P)=\sum_{i=1}^{N-1}\sqrt{(x_i-x_{i-1})^2+(y_i-y_{i-1})^2}.
\]

The implementation returns \(0\) for a path with no segments. `extractInvariants` substitutes \(1\) when the resulting length is falsy.

### Winding estimate

`windingNumber` computes the direction angle of successive segments, wraps each angle difference to \([-\pi,\pi]\), sums those differences, and rounds the total number of turns:

\[
\Delta_i = \operatorname{atan2}\!\left(\sin(\alpha_i-\alpha_{i-1}),
                                      \cos(\alpha_i-\alpha_{i-1})\right),
\qquad
\widehat{W}(P)=\operatorname{round}\!\left(\frac{\sum_i\Delta_i}{2\pi}\right).
\]

This is a discrete turning-angle estimate, not a general robust topological invariant extractor. The input is not checked for closure, degeneracy, sampling quality, or noise. `extractInvariants` concatenates all strokes before computing path length and winding, so the current implementation also treats the last point of one stroke and the first point of the next as adjacent.

### Extracted feature object

For the supplied array of strokes, `extractInvariants` returns an object with these keys:

\[
\mathbf{I} = (L,\widehat{W},N_s,T_s),
\]

where \(L\) is the concatenated path length, \(\widehat{W}\) is the winding estimate, \(N_s\) is the number of strokes, and

\[
T_s = \sum_{p\in P}p.t
\]

is the sum of each point's `t` field. Despite the property name `duration`, this is not calculated as elapsed time (such as last timestamp minus first timestamp). The code substitutes \(1\) for a zero/falsy length, stroke count, or time sum. It assumes points have numeric `x`, `y`, and `t` values and does not validate them.

### Fibonacci sequence helper

`fibTime(n)` returns the first \(n\) Fibonacci-like values beginning \(1,1\):

\[
F_1=1,\quad F_2=1,\quad F_n=F_{n-1}+F_{n-2}.
\]

It returns an array of numbers only. It does not schedule events, measure time, generate challenges, or provide replay protection. The impulse-train expression

\[
T_{\mathrm{Fib}}(t)=\sum_n\delta(t-F_nT_0)
\]

is a possible theoretical direction, but is **not implemented** by this helper.

### Point transformation

`mirrorPoint(p,c)` currently returns coordinates

\[
x'=c+x,\qquad y'=c+y,
\]

and copies the other properties of \(p\). This follows directly from the implementation expressions `c - (-p.x)` and `c - (-p.y)`. It is a translation, not a reflection, and is not the proposed operator \(\mathcal{M}S(x)=C-S(-x)\). `applyMirror` maps this point transformation over a stroke. The function names should not be interpreted as evidence of a mirror challenge-response protocol.

### Template tolerance and score

`buildTemplate` retains the supplied `invariants` object and creates a per-key tolerance

\[
\tau_k=\max(0.15I_k,0.1).
\]

For each key in the template, `calculateScore` takes the corresponding actual value (defaulting a missing or nullish value to \(0\)), uses tolerance \(\tau_k\) (defaulting to \(1\) if absent), caps the normalized absolute difference at \(1\), and averages across keys:

\[
S(E,A)=
\begin{cases}
\displaystyle\frac{1}{K}\sum_{k=1}^{K}
\min\!\left(\frac{|E_k-A_k|}{\tau_k},1\right), & K>0,\\[6pt]
1, & K=0.
\end{cases}
\]

`isAuthentic(score, threshold = 0.35)` returns `true` exactly when

\[
\operatorname{Math.sign}(\theta-S)>0,
\]

which means the comparison is **strict**: a score equal to the threshold is not accepted. The score is a prototype similarity measure, not a calibrated probability or a security-grade authentication decision.

## Architecture & Security Model

### Modules as implemented

| File | Current behavior |
| --- | --- |
| `types.js` | Exports an empty object: `Types = {}`. No data types or schemas are currently defined. |
| `math.js` | Exports `TAU`, `PHI`, `pathLength`, `windingNumber`, `extractInvariants`, `fibTime`, `mirrorPoint`, and `applyMirror`. `PHI` is defined but not used by the other functions in this module. |
| `protocol.js` | Exports `buildTemplate`, `calculateScore`, and `isAuthentic`. It performs in-memory object construction, numeric scoring, and a threshold comparison; it does not persist data or communicate with a server. |

### Data and trust boundaries

The repository currently defines no network service, database, sensor capture, enrollment workflow, storage format, cryptographic protocol, or transport-security configuration. Consequently, it does not establish that a server stores less than 1 KB, stores no raw data, or renders breached data useless. Those properties depend on systems and implementation code that are not present here.

Likewise, storing extracted features instead of raw gesture media would be data minimization, but would not by itself constitute zero-knowledge. A formal zero-knowledge claim requires a defined cryptographic statement and protocol, stated assumptions, and an appropriate security proof. No such protocol or proof is included in this repository.

### Security interpretation and limitations

- **No complete authentication protocol:** the current functions are local utilities and scoring primitives. They do not authenticate an account or establish a user's identity.
- **No anti-replay implementation:** `fibTime` computes sequence values but does not create unpredictable, single-use challenges, validate freshness, track used responses, or enforce expiration.
- **No mirror challenge-response:** the point transform is a translation, and no challenge issuance or response verification flow exists.
- **No validated biometric or behavioral security:** gesture features can be noisy, observable, reproducible, or imitable. The code includes no threat model, liveness detection, accessibility analysis, or false-accept/false-reject evaluation.
- **No input hardening:** empty arrays, malformed points, non-finite numbers, negative feature values, and inconsistent template objects are not comprehensively validated. The default tolerances and threshold are illustrative implementation constants, not empirically calibrated values.
- **No “zero branching” guarantee:** `Math.sign()` implements a final comparison expression, but JavaScript code still contains branches and fallback behavior. Coding style does not establish constant-time execution or security.

The prototype is best treated as a starting point for mathematical experimentation. Before any real authentication use, it would need a precise threat model, validated feature definitions, robust input handling, a cryptographically sound freshness mechanism, secure enrollment and recovery, privacy analysis, empirical threshold evaluation, and independent security review.

## License

This project is distributed under the **GNU Affero General Public License, version 3.0 (AGPL-3.0)**. See [`LICENSE`](LICENSE) for the complete terms.
