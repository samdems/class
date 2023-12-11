
# Advanced Light Control Adventure! 🌟🚀

## Objective:

Welcome back, young wizards! Today, we'll enhance our magical light adventure by adding a special button spell. Get ready for some advanced coding magic!

## The Magical Loop:

```python
# Our magical loop still runs forever, but now with added button magic!
while True:
    if is_button_pressed():   # Check if the magic button is pressed
        magical_light_toggle() # Toggle the magic light
    pause_for_a_while()
```

## The Magic Spells:

- `is_button_pressed()`: A magical spell that checks if the enchanted button is pressed.
- `magical_light_toggle()`: Toggles the magic light, turning it on if it's off and off if it's on.

## Let's Peek at the New Spells:

```python
from time import sleep
import machine

# Creating magical pins for our light and button
pin_light = machine.Pin(2, machine.Pin.OUT)
pin_button = machine.Pin(5, machine.Pin.IN, machine.Pin.PULL_UP)

# Spell to check if the magic button is pressed
def is_button_pressed():
    return not pin_button.value()

# Spell to toggle the magic light
def magical_light_toggle():
    if pin_light.value() == 1:
        pin_light.off()
    else:
        pin_light.on()
```

## It's Your Turn to Play Again! 🎮

Now, it's time to experiment with the new spells! Press the enchanted button and watch the magic light respond. What other spells can you create?

## Conclusion:

Fantastic work, little wizards! You've now added a new dimension to your coding adventure. Keep exploring, tinkering, and making your magic even more enchanting!

```python
while True:
    if is_button_pressed():
        magical_light_toggle()
    pause_for_a_while()
    print('magical loop!')
```

Keep having a magical time with your coding journey! ✨🚀
```

