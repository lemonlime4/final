# uiua version 0.10.3
# generate bayer matrix
Bayer ← (
  ⊙2⊙[0_2 3_1]
  ◌⍥⟜(
    ⊃(∘××.|+2××.|+3××.|+1××.)
    ⊂∩≡⊂
  )
)

÷⊢⊢⇌.Bayer 2
&fwa "assets/textures/bayer.png" &ime "png"
