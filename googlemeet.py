import os
import time
import autopy
import webbrowser
import mouse
import keyboard
from time import sleep
from selenium import webdriver

link = input("Enter the Google Meet Link of the lecture -> ")
start = input("Enter the time when the lecture will start as (Format:- HH:MM:SS)(24 hour format) -> ")
stop = input("Enter the time when the lecture will stop as (Format:- HH:MM:SS)(24 hour format) -> ")

br=webdriver.Ie(executable_path=r"C:/Users/sid33/node_modules/iedriver/lib/iedriver/IEDriverServer.exe")

Current_time = time.strftime("%H:%M:%S") 

while (Current_time != start): 
    print ("Waiting, the current time is " + Current_time +" :-( " )
    Current_time = time.strftime("%H:%M:%S") 
    time.sleep(1)
if (Current_time == start): 
    print ("You are now attending the Google Meet lecture :D") 
    br.get(link)   
    time.sleep(12)
    keyboard.press_and_release('Ctrl + e, Ctrl + d')
    autopy.mouse.move(1150,420)
    mouse.click('left')   
    while (Current_time != stop):
        print ("You are attending the lecture, current time is " + Current_time +" :-) " )
        Current_time = time.strftime("%H:%M:%S") 
        time.sleep(1)
    if (Current_time == stop):
        print("You have successfully attended the Google Meet Lecture ^_^")
        br.quit()      