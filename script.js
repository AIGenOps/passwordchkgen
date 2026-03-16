
document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const passwordInput = document.getElementById('passwordInput');
    const toggleBtn = document.getElementById('togglePassword');
    const copyBtn = document.getElementById('copyPassword');
    const generateBtn = document.getElementById('generateBtn');
    const themeToggle = document.getElementById('themeToggle');
    
    // Stats
    const entropyValue = document.getElementById('entropyValue');
    const crackTimeDisplay = document.getElementById('crackTime');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    // Requirements
    const reqs = {
        length: document.getElementById('req-length'),
        lower: document.getElementById('req-lower'),
        upper: document.getElementById('req-upper'),
        number: document.getElementById('req-number'),
        special: document.getElementById('req-special'),
        common: document.getElementById('req-common')
    };

    // Generator Controls
    const lengthSlider = document.getElementById('lengthSlider');
    const lengthValue = document.getElementById('lengthValue');
    const optUpper = document.getElementById('opt-upper');
    const optLower = document.getElementById('opt-lower');
    const optNumber = document.getElementById('opt-number');
    const optSymbol = document.getElementById('opt-symbol');

    // Suggestions
    const suggestionBox = document.getElementById('suggestionBox');
    const suggestionTags = document.getElementById('suggestionTags');

    // --- Common Passwords List (Top 50 truncated for demo) ---
    const commonPasswords = [
        "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111", 
        "1234567", "dragon", "baseball", "football", "monkey", "letmein", "shadow", "master", 
        "666666", "qwertyuiop", "123321", "mustang", "1234567890", "michael", "superman", 
        "1qaz2wsx", "7777777", "121212", "000000", "qazwsx", "123qwe", "killer", "trustno1", 
        "jordan", "jennifer", "zxcvbnm", "asdfgh", "hunter", "buster", "soccer", "harley", 
        "batman", "andrew", "tigger", "sunshine", "iloveyou", "2000", "charlie", "robert", 
        "thomas", "hockey", "ranger", "daniel", "starwars", "klaster", "112233", "george", 
        "computer", "michelle", "jessica", "pepper", "1111", "zxcvbn", "555555", "11111111", 
        "131313", "freedom", "777777", "pass", "maggie", "159753", "aaaaaa", "ginger", "princess", 
        "joshua", "cheese", "amanda", "summer", "love", "ashley", "nicole", "chelsea", "biteme", 
        "matthew", "access", "yankees", "987654321", "dallas", "austin", "thunder", "taylor", "matrix"
    ];

    // --- Theme Logic ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        // Save preference
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Toggle Icon
        const icon = themeToggle.querySelector('i');
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    });

    // --- Main Logic ---

    function updateAnalysis() {
        const password = passwordInput.value;
        
        // 1. Validate Requirements
        checkRequirements(password);

        // 2. Calculate Entropy & Crack Time
        const entropy = calculateEntropy(password);
        entropyValue.textContent = `${Math.floor(entropy)} bits`;
        
        const time = calculateCrackTime(entropy);
        crackTimeDisplay.textContent = time;

        // 3. Update Meter Visuals
        updateMeter(password);

        // 4. Generate Suggestions if Weak
        generateSuggestions(password);
    }

    function checkRequirements(pwd) {
        const checks = {
            length: pwd.length >= 8,
            lower: /[a-z]/.test(pwd),
            upper: /[A-Z]/.test(pwd),
            number: /[0-9]/.test(pwd),
            special: /[^A-Za-z0-9]/.test(pwd),
            common: !commonPasswords.includes(pwd.toLowerCase())
        };

        // Update UI for each check
        for (const [key, isValid] of Object.entries(checks)) {
            const el = reqs[key];
            const icon = el.querySelector('i');
            
            if (isValid) {
                el.classList.add('valid');
                el.classList.remove('warning');
                icon.classList.replace('fa-circle', 'fa-check');
                icon.classList.replace('fa-circle-exclamation', 'fa-check');
            } else {
                el.classList.remove('valid');
                if(key === 'common' && pwd.length > 0) {
                    el.classList.add('warning');
                    icon.classList.replace('fa-check', 'fa-circle-exclamation');
                    icon.classList.replace('fa-circle', 'fa-circle-exclamation');
                } else {
                    el.classList.remove('warning');
                    icon.classList.replace('fa-check', 'fa-circle');
                    icon.classList.replace('fa-circle-exclamation', 'fa-circle');
                }
            }
        }
        return Object.values(checks).every(Boolean);
    }

    function calculateEntropy(pwd) {
        if (!pwd) return 0;
        
        let pool = 0;
        if (/[a-z]/.test(pwd)) pool += 26;
        if (/[A-Z]/.test(pwd)) pool += 26;
        if (/[0-9]/.test(pwd)) pool += 10;
        if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
        
        // Entropy = Length * log2(PoolSize)
        return pwd.length * Math.log2(pool || 1);
    }

    function calculateCrackTime(entropy) {
        if (entropy === 0) return "Instant";
        
        // Assume a fast cracking rig: 10 Billion guesses/sec (10^10)
        // This is a generic offline hash cracking speed
        const guessesPerSecond = 10000000000; 
        const totalCombinations = Math.pow(2, entropy);
        const seconds = totalCombinations / guessesPerSecond;

        if (seconds < 1) return "Instant";
        if (seconds < 60) return `${Math.floor(seconds)} seconds`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
        if (seconds < 31536000) return `${Math.floor(seconds / 86400)} days`;
        if (seconds < 3153600000) return `${Math.floor(seconds / 31536000)} years`;
        return "Centuries";
    }

    function updateMeter(pwd) {
        // Scoring logic: 1 point per requirement + bonus for length
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        
        // Penalty for common passwords
        if (commonPasswords.includes(pwd.toLowerCase())) score = 1;

        let percent = Math.min(100, (score / 6) * 100);
        
        if (pwd.length === 0) {
            percent = 0;
            strengthText.textContent = "Start typing...";
            strengthText.style.color = "var(--text-muted)";
            strengthBar.style.width = '0%';
            return;
        }

        if (score <= 2) {
            strengthText.textContent = "Weak";
            strengthText.style.color = "var(--strength-weak)";
            strengthBar.style.backgroundColor = "var(--strength-weak)";
        } else if (score <= 4) {
            strengthText.textContent = "Medium";
            strengthText.style.color = "var(--strength-medium)";
            strengthBar.style.backgroundColor = "var(--strength-medium)";
        } else {
            strengthText.textContent = "Strong";
            strengthText.style.color = "var(--strength-strong)";
            strengthBar.style.backgroundColor = "var(--strength-strong)";
        }
        
        strengthBar.style.width = `${percent}%`;
    }

    function generateSuggestions(pwd) {
        if (pwd.length === 0) {
            suggestionBox.classList.add('hidden');
            return;
        }

        // Only show suggestions if password is weak or medium
        // and not a common password
        const isCommon = commonPasswords.includes(pwd.toLowerCase());
        const isWeak = pwd.length < 8 || isCommon;

        if (isWeak && pwd.length > 0) {
            suggestionBox.classList.remove('hidden');
            suggestionTags.innerHTML = '';
            
            // Suggestion 1: Leet Speak
            const leet = pwd
                .replace(/a/g, '@').replace(/A/g, '@')
                .replace(/e/g, '3').replace(/E/g, '3')
                .replace(/i/g, '!').replace(/I/g, '!')
                .replace(/o/g, '0').replace(/O/g, '0')
                .replace(/s/g, '$').replace(/S/g, '$');
            
            createSuggestionTag(leet);

            // Suggestion 2: Append Year
            const currentYear = new Date().getFullYear();
            createSuggestionTag(pwd + currentYear + "!");

            // Suggestion 3: Random Symbols
            createSuggestionTag(pwd + "#" + Math.floor(Math.random() * 999));
        } else {
            suggestionBox.classList.add('hidden');
        }
    }

    function createSuggestionTag(text) {
        const tag = document.createElement('div');
        tag.className = 'suggestion-tag';
        tag.textContent = text;
        tag.onclick = () => {
            passwordInput.value = text;
            updateAnalysis();
            // Show the password in plain text temporarily
            passwordInput.type = "text";
            document.getElementById('eyeIcon').classList.replace('fa-eye', 'fa-eye-slash');
        };
        suggestionTags.appendChild(tag);
    }

    // --- Generator Logic ---
    lengthSlider.addEventListener('input', (e) => {
        lengthValue.textContent = e.target.value;
    });

    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        const chars = {
            upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lower: "abcdefghijklmnopqrstuvwxyz",
            number: "0123456789",
            symbol: "!@#$%^&*()_+~`|}{[]:;?><,./-="
        };

        let validChars = "";
        let password = "";

        if (optUpper.checked) validChars += chars.upper;
        if (optLower.checked) validChars += chars.lower;
        if (optNumber.checked) validChars += chars.number;
        if (optSymbol.checked) validChars += chars.symbol;

        if (validChars === "") {
            alert("Please select at least one character type.");
            return;
        }

        // Ensure at least one of each selected type
        if (optUpper.checked) password += getRandomChar(chars.upper);
        if (optLower.checked) password += getRandomChar(chars.lower);
        if (optNumber.checked) password += getRandomChar(chars.number);
        if (optSymbol.checked) password += getRandomChar(chars.symbol);

        // Fill remaining length
        for (let i = password.length; i < length; i++) {
            password += getRandomChar(validChars);
        }

        // Shuffle
        password = password.split('').sort(() => 0.5 - Math.random()).join('');

        passwordInput.value = password;
        passwordInput.type = "text"; // Show generated
        document.getElementById('eyeIcon').className = "fa-solid fa-eye-slash";
        
        updateAnalysis();
    }

    function getRandomChar(str) {
        return str.charAt(Math.floor(Math.random() * str.length));
    }

    // --- Utility Events ---
    function togglePasswordVisibility() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        const icon = document.getElementById('eyeIcon');
        if (type === 'text') {
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }

    function copyToClipboard() {
        const password = passwordInput.value;
        if (!password) return;
        navigator.clipboard.writeText(password).then(() => {
            const icon = document.getElementById('copyIcon');
            icon.classList.replace('fa-copy', 'fa-check');
            setTimeout(() => icon.classList.replace('fa-check', 'fa-copy'), 2000);
        });
    }

    // Listeners
    passwordInput.addEventListener('input', updateAnalysis);
    toggleBtn.addEventListener('click', togglePasswordVisibility);
    copyBtn.addEventListener('click', copyToClipboard);
    generateBtn.addEventListener('click', generatePassword);
});
