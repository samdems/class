from spellbook import (
    pause_for_a_while,
    magical_light_on,
    magical_light_off,
    is_button_pressed,
    magical_light_toggle,
)

# Our magical loop still runs forever, but now with added button magic!
while True:
    if is_button_pressed():   # Check if the magic button is pressed
        magical_light_toggle() # Toggle the magic light
    pause_for_a_while()
    print('magical loop!')