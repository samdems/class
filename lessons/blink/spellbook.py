from time import sleep
import machine

# Creating magical pins for our light and button
pin_light = machine.Pin(2, machine.Pin.OUT)
pin_button = machine.Pin(5, machine.Pin.IN, machine.Pin.PULL_UP)

# Spell to light up the magic light
def magical_light_on():
    pin_light.off()

# Spell to turn off the magic light
def magical_light_off():
    pin_light.on()

# Spell to pause the magic adventure for a while
def pause_for_a_while(time=0.5):
    sleep(time)

# Spell to check if the magic button is pressed
def is_button_pressed():
    return not pin_button.value()

# Spell to toggle the magic light
def magical_light_toggle():
    if pin_light.value() == 1:
        pin_light.off()
    else:
        pin_light.on()
