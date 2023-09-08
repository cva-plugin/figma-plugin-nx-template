log "Checking if Figma is running..."
if application "Figma" is running then
	log "Figma is running. Activating Figma..."
	tell application "Figma" to activate
	tell application "System Events"
		tell application process "Figma"
			set frontmost to true
			set winList to windows whose name contains "Plugin"
			log "Number of windows found: " & (length of winList)
			if length of winList = 1 then
				set targetWindow to item 1 of winList
				log "Raising: " & name of targetWindow 
				perform action "AXRaise" of targetWindow
        log "Sending keystrokes..." 
        -- Add delay to allow the window to appear
        delay 1
				keystroke "p" using {command down, option down}
        delay .5
			else
				log "Window not found"
				return "Window not found"
			end if
		end tell
	end tell

	log "Activating Visual Studio Code..."
	tell application "Visual Studio Code" to activate
	log "Done"
	return "Running"
else
	log "Figma is not running"
	return "Not running"
end if
