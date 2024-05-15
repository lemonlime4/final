Dim ← 128_128
Sigma ← 1.9

Divisor ← ××2.Sigma
ELUT ← ≡≡(
  /+ⁿ2-⌵-⟜:÷2Dim # toroidal distance
  ⁿ:e¯÷Divisor   # gaussian
) ⇡Dim

# generate energy table at pixel
Energy ← ↻:ELUT¯
Up ← ⍜⊙⍉▽⟜▽

# prototype binary pattern and its energy
<0.1∵⋅⚂.↯Dim0
∧(+Energy)⟜(&p⧻)⊚⟜:

# spread out binary pattern points
⍥(
  ⊢⊚=/↥♭.×,,
  ⊃(-Energy ⊙∘|⍜⊡⋅0 ⊙⋅∘)
  ⊢⊚=/↧♭.. # ⊢⊚=/↧♭.×⊙⟨1|∞⟩,,
  ⊃(+Energy ⊙∘|⍜⊡⋅1 ⊙⋅∘)
)∞
⊙⟜(&p⧻⊚)

# phase 1 - order the binary pattern
&p"Phase 1"
:⊙(⧻⊚.)            # number of ones
⊃(⊙⊙∘|↯Dim0⊙⊙∘|+1) # duplicate data for ordering alg
⍥(
  ⊢⊚=/↥♭.×,,
  ⊃(
    -Energy ⊙∘     # subtract energy
  | ⍜⊡⋅0 ⊙⋅∘       # remove from initial binary pattern
  | ⍜⊡⋅∘ ⊙⋅⋅⊙⟜(-1) # update indices
  )
)
⋅⋅⊙°0 # indices, energy, binary pattern, next index
# phase 2 - fill voids until 50% full
&p"Phase 2"
⊃(⋅⋅⋅∘|⋅∘|⋅⋅⟨1|∞⟩|⊙⋅⋅∘) # reorder stack, invert bp
-:⌊÷2/×Dim
⍥(
  ⊢⊚=/↧♭.×,,
  ⊃(
    +Energy ⊙∘
  | ⍜⊡⋅∞ ⊙⋅∘
  | ⍜⊡⋅∘ ⊙⋅⋅⊙⟜(+1)
  )
)
# phase 3 - fill all cluster of 0s
&p"Phase 3"
=1◌
∧(+Energy):↯Dim0⊚. # rebuild energy map
+1-:/×Dim⊃⋅⋅⋅∘⊙⊙⊙∘
⍥(
  ⊢⊚=/↥♭.×,,
  ⊃(
    -Energy ⊙∘
  | ⍜⊡⋅0 ⊙⋅∘
  | ⍜⊡⋅∘ ⊙⋅⋅⊙⟜(+1)
  )
)
⋅⋅⊙(°1-/×Dim)
÷/×Dim-1

&p"Writing"
&fwa "bluenoisetest.png" &ime "png"
