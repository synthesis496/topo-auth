# Topo-Auth

## Structural Absence Protocol

Topo-Auth is an experimental passwordless authentication concept built around geometric and topological gesture features. The project explores whether a gesture can be compared through compact mathematical invariants instead of retaining raw recordings or password-style credentials.

> **Core principle:** Imposters are not blocked through escalating `if-else` statements; they are structurally absent from the accepted mathematical relation.

**Live demo:** [https://synthesis496.github.io/topo-auth/](https://synthesis496.github.io/topo-auth/)

## How to Play — Live Demo

1. Click **Register** and draw any shape to generate a mathematical template.
2. Click **Verify** to receive a randomized challenge.
3. The system requests either a **NORMAL** or **MIRROR** gesture.
4. Draw exactly **3 strokes** while matching the Fibonacci Timing Clock shown in the HUD:
   - Stroke 1: **1 second**
   - Stroke 2: **1 second**
   - Stroke 3: **2 seconds**
5. Click **Verify** again to view the resulting score. Failure in timing or geometry produces:

> **STRUCTURALLY ABSENT**

## Mathematical Foundation

### Gesture Representation

A gesture is modeled as a path:

\[
S:[0,1]\rightarrow\mathbb{R}^{2}.
\]

Instead of comparing raw pixel coordinates, the protocol compares derived path properties.

### Path Length

For a sequence of points \(S_i=(x_i,y_i)\), path length is approximated by:

\[
L(S)=\sum_{i=1}^{n-1}
\sqrt{(x_{i+1}-x_i)^2+(y_{i+1}-y_i)^2}.
\]

Path length captures traversal magnitude while reducing sensitivity to absolute display position.

### Winding Number

The winding number describes how many times a closed path circulates around a reference point \(p\):

\[
W(S,p)=\frac{1}{2\pi}\oint_S d\arg(z-p).
\]

For discrete angular segments \(\alpha_i\), an estimate can be calculated as:

\[
\widehat{W}(S)=\operatorname{round}\!
\left(
\frac{\sum_i\Delta_i}{2\pi}
\right).
\]

where:

\[
\Delta_i=\operatorname{atan2}\!
\left(
\sin(\alpha_i-\alpha_{i-1}),
\cos(\alpha_i-\alpha_{i-1})
\right).
\]

The extracted feature vector can therefore be represented as:

\[
I(S)=\left(L(S),W(S,p),N_s,T_s\right),
\]

where \(N_s\) is the stroke count and \(T_s\) is a timing-related feature.

### Mirror Operator

Shoulder-surfing resistance is based on a challenge-dependent transformation:

\[
M S(x)=C-S(-x).
\]

Here:

- \(S(x)\) is the original gesture trajectory.
- \(S(-x)\) applies spatial reflection.
- \(C\) is a centering or translation constant.
- \(MS(x)\) is the challenge-oriented transformed gesture.

The active challenge is therefore selected according to:

\[
S'=\begin{cases}
S,&\text{NORMAL},\\
MS,&\text{MIRROR}.
\end{cases}
\]

> **Implementation note:** The current point utility is a translation based on `c - (-p.x)` and `c - (-p.y)`. Full challenge-response mirror verification is not yet implemented.

### Fibonacci Timing

Anti-replay behavior is represented by a Fibonacci-derived three-phase clock:

\[
T_{\mathrm{Fib}}=(1\,\mathrm{s},1\,\mathrm{s},2\,\mathrm{s}).
\]

The total execution window is:

\[
T_{\Sigma}=1+1+2=4\,\mathrm{s}.
\]

Observed and expected stroke intervals can be normalized as:

\[
\tau_i=\frac{\Delta t_i-t_i}{t_i}.
\]

> **Implementation note:** The repository currently provides a Fibonacci sequence helper, `fibTime(n)`. It does not yet schedule challenges or enforce real three-stroke timing and replay resistance.

## Security Architecture — Why It Is Different

### Zero-Knowledge-Oriented Design

The intended design retains mathematical invariants instead of raw biometric images or gesture recordings. A compact template may contain fewer than 1 KB of extracted feature data.

However, this prototype **does not implement a formal zero-knowledge protocol**. Extracted features are not cryptographic proofs, and storing invariants alone is not sufficient to establish zero-knowledge security.

### Algebraic Decision Model

The protocol is designed to express acceptance as a relationship over feature distance:

\[
V=\operatorname{sign}\left(\varepsilon-I_{\Delta}\right),
\]

where:

\[
I_{\Delta}=\left\|I(S_{\mathrm{observed}})-I(S_{\mathrm{template}})\right\|.
\]

The implementation uses the sign operation:

```javascript
Math.sign(threshold - score)
```

rather than building authentication decisions solely through nested `if-else` statements.

This is a **design philosophy**, not a security guarantee. JavaScript still requires branches and fallback logic, and the full application must include secure challenge generation, transport, storage, rate limiting, and threat modeling.

## Repository Status and Limitations

Topo-Auth is an experimental JavaScript prototype. The current repository provides local mathematical utilities for:

- Path-length calculation
- Discrete winding estimation
- Invariant extraction
- Fibonacci sequence generation
- Template tolerance construction
- Numeric score calculation
- Threshold comparison

It does not currently provide:

- A production authentication service
- Persistent credential storage
- Cryptographic enrollment or verification
- Anti-replay challenge issuance
- A complete mirror challenge-response flow
- A formal zero-knowledge proof
- Liveness, sensor integrity, or calibrated biometric guarantees

Use the demo for mathematical experimentation only. Before real authentication deployment, the system requires a formal threat model, validated feature engineering, cryptographic protocol design, secure storage, and independent security review.

## License

Topo-Auth is distributed under the **GNU Affero General Public License, version 3.0 (AGPL-3.0)**. See [`LICENSE`](LICENSE) for the complete terms.
