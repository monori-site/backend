function Build-Arisu {
    echo "[Arisu] Now compiling Arisu..."

    Java-Exists
    Clean
    Compile

    echo "[Arisu] Compiled Arisu successfully, maybe? Don't know since I'm just a program so I have no idea..."
}

function Java-Exists {
    try {
        echo "[Arisu] Checking if Java exists in runtime..."
        java --version
    } catch {
        echo "[Arisu] Java doesn't exist in this machine, did you install it?"
        exit
    }
}

function Clean {
    try {
        rm build -Force
    } catch {
        echo "[Arisu] Build directory is non-existant, don't need to exist."
    }
}

function Compile {
    try {
        .\gradlew build
    } catch {
        echo "[Arisu] Compiled result returned as an error, what is it?"
        exit
    }
}

Build-Arisu
