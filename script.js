document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const resultsContainer = document.getElementById('results-container');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateInputs()) {
            const results = calculateAllResults();
            displayResults(results);
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    });

    function validateInputs() {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.classList.remove('input-error');
            if (!input.value || (input.type === 'number' && parseFloat(input.value) < 0)) {
                isValid = false;
                input.classList.add('input-error');
            }
        });
        return isValid;
    }

    // --- CALCULATION LOGIC ---

    function calculateAllResults() {
        const results = {};

        // Test 1: Cardiorespiratory Endurance
        const t1_val = parseFloat(document.getElementById('test1-stange').value);
        results.test1 = calculateCardioEndurance(t1_val);

        // Test 2: Strength
        const gender = document.getElementById('test2-gender').value;
        const t2_right = parseFloat(document.getElementById('test2-right').value);
        const t2_left = parseFloat(document.getElementById('test2-left').value);
        results.test2 = calculateStrength(t2_right, t2_left, gender);

        // Test 3: Cardio Test (Leg Swings)
        const t3_val = parseInt(document.getElementById('test3-pulse').value);
        results.test3 = calculateCardioPulse(t3_val);

        // Test 4: Flexibility
        const t4a_val = parseInt(document.getElementById('test4a-legs').value);
        results.test4a = calculateFlexibilityLegs(t4a_val);
        const t4b_right = parseInt(document.getElementById('test4b-right').value);
        const t4b_left = parseInt(document.getElementById('test4b-left').value);
        results.test4b = calculateFlexibilityArms(t4b_right, t4b_left);

        // Test 5: Balance
        const t5_right = parseFloat(document.getElementById('test5-right').value);
        const t5_left = parseFloat(document.getElementById('test5-left').value);
        results.test5 = calculateBalance(t5_right, t5_left);

        // Overall Score
        const scores = [results.test1.score, results.test2.score, results.test3.score, results.test4a.score, results.test4b.score, results.test5.score];
        results.overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        results.overallDescription = getOverallDescription(results.overallScore);

        return results;
    }

    // --- Individual Test Calculators ---

    function calculateCardioEndurance(val) {
        let score, recommendation;
        if (val >= 90) {
            score = 100;
            recommendation = "Excellent cardiorespiratory endurance. All types of activities are suitable for further training. Keep it up and maintain a high level of physical activity to preserve excellent shape.";
        } else if (val >= 60) {
            score = 75;
            recommendation = "Excellent result at this level. To continue improvements, add yoga, functional exercises, and TRX training for comprehensive body work and improved flexibility.";
        } else if (val >= 45) {
            score = 50;
            recommendation = "Initial level of cardiorespiratory endurance. For further progress, add breathing practices and endurance training, as well as start working with interval cardio sessions to increase endurance with heart rate control.";
        } else { // Handles 30-45 and below 30
            score = 25;
            recommendation = "If values are below 30 seconds, it may indicate high stress, body acidification, and low endurance levels; it is necessary to improve overall health. It is recommended to focus on increasing general physical fitness and including regular cardio loads.";
        }
        return { value: `${val}s`, score, recommendation };
    }

    function calculateStrength(right, left, gender) {
        const asymmetryData = checkAsymmetry(right, left, 25);
        let value = asymmetryData.value;
        let score, recommendation;

        const thresholds = (gender === 'male') 
            ? { min: 40, avg: 45, good: 60 }
            : { min: 15, avg: 20, good: 30 };
        
        const recs = (gender === 'male') ? {
            min: "Focus on functional strength training and myofascial release to relieve spasms. If the strength difference between the right and left hand exceeds 25%, it is recommended to consult an osteopath or massage therapist.",
            avg: "Add strength training and learn to activate muscles more effectively. Work on engaging all muscle groups to improve results and progress.",
            good: "Good result, however it can be improved with TRX and functional exercises. This will help develop strength, endurance, and improve overall physical fitness.",
            exc: "Excellent result! All types of activities are suitable for further physical fitness improvement. Maintain a high level of training, and continue developing your skills."
        } : {
            min: "Focus on functional strength training and myofascial release to relieve spasms. If the strength difference between the right and left hand exceeds 15%, it is recommended to consult an osteopath or massage therapist.",
            avg: "Add strength training and learn to activate muscles more effectively. Work on engaging all muscle groups to improve results and progress.",
            good: "Good result, however it can be improved with TRX and functional exercises. This will help develop strength, endurance, and improve overall physical fitness.",
            exc: "Excellent result! All types of activities are suitable for further physical fitness improvement. Maintain a high level of training, and continue developing your skills."
        }

        if (value >= thresholds.good) {
            score = (value >= (gender === 'male' ? 60 : 30)) ? 100 : 75; // Corrected to distinguish good/excellent
            recommendation = (score === 100) ? recs.exc : recs.good;
        } else if (value >= thresholds.avg) {
            score = 50;
            recommendation = recs.avg;
        } else {
            score = 25;
            recommendation = recs.min;
        }

        return { value: `R: ${right}kg, L: ${left}kg`, score, recommendation, asymmetry: asymmetryData.asymmetry, asymmetryNote: asymmetryData.note };
    }

    function calculateCardioPulse(val) {
        let score, recommendation;
        if (val <= 50) { // <50% Zone
            score = 100;
            recommendation = "The heart’s response to load is excellent, you can increase the complexity of workouts. The body is well prepared and effectively handles loads without signs of overfatigue. Excellent adaptation allows for workouts without restrictions, but it is recommended to monitor the pulse in particularly complex workouts to ensure safety.";
        } else if (val <= 70) { // 60-70% Zone
            score = 75;
            recommendation = "The heart’s response to load is very good, the body is well prepared and effectively handles loads without signs of overfatigue. Good adaptation allows for intense workouts and practices without significant restrictions, but always consider individual sensations.";
        } else if (val <= 80) { // 80% Zone
            score = 50;
            recommendation = "The pulse response to load is average, indicating insufficient adaptation for more intense workouts. Need to improve adaptation and expand the program by adding endurance training, including resistance band exercises, cardio, and TRX. Integrate more cardio and functional training for further progress.";
        } else { // 90-100% Zone
            score = 25;
            recommendation = "The pulse response to load is elevated, which may indicate the need for additional attention to overall health and the cardiovascular system. It is recommended to carefully monitor the pulse during all intense workouts to avoid overloads. Include breathing exercises for improved recovery and light cardio sessions for gradual adaptation.";
        }
        const pulseMap = { 95: '90-100%', 80: '80%', 65: '60-70%', 45: '<50%' };
        return { value: `Zone ${pulseMap[val]}`, score, recommendation };
    }
    
    function calculateFlexibilityLegs(val) {
        let score = val;
        let recommendation;
        const textMap = { 25: 'Reach to knee', 50: 'Reach to shin/foot', 75: 'Reach to floor (fists)', 100: 'Reach to floor (palms)' };
        switch(score) {
            case 100: recommendation = "Excellent flexibility! Keep it up. If there is hypermobility, it is recommended to additionally strengthen muscles to maintain stability and prevent injuries."; break;
            case 75: recommendation = "Continue developing flexibility by adding more complex stretching workouts and functional exercises to improve mobility and strengthen muscles."; break;
            case 50: recommendation = "It is recommended to include practices for relieving muscle clamps and injury prevention: myofascial release (MFR), massage, yoga, and somatic methods to increase flexibility and mobility."; break;
            case 25: recommendation = "Consultation with an osteopath, massage, and basic stretching exercises, as well as light yoga, are required to improve flexibility and eliminate muscle tensions."; break;
        }
        return { value: textMap[score], score, recommendation };
    }

    function calculateFlexibilityArms(right, left) {
        const asymmetryData = checkAsymmetry(right, left, 25); // Using % values
        let score = asymmetryData.value;
        let recommendation;
        const textMap = { 25: 'Large gap', 50: 'Small gap', 75: 'Fingers touch', 100: 'Fingers overlap' };

        switch(Math.round(score / 25) * 25) { // Round score to nearest 25
            case 100: recommendation = "Excellent flexibility! Keep it up. If there is hypermobility, it is recommended to additionally strengthen muscles to maintain stability and prevent injuries."; break;
            case 75: recommendation = "Continue developing flexibility by adding more complex stretching workouts and functional exercises to improve mobility and strengthen muscles."; break;
            case 50: recommendation = "It is recommended to include practices for relieving muscle clamps and injury prevention: myofascial release (MFR), massage, yoga, and somatic methods to increase flexibility and mobility."; break;
            case 25: recommendation = "Consultation with an osteopath, massage, and basic stretching exercises, as well as light yoga, are required to improve flexibility and eliminate muscle tensions."; break;
        }

        return { value: `R: ${textMap[right]}, L: ${textMap[left]}`, score, recommendation, asymmetry: asymmetryData.asymmetry, asymmetryNote: asymmetryData.note };
    }

    function calculateBalance(right, left) {
        const asymmetryData = checkAsymmetry(right, left, 25);
        let value = asymmetryData.value;
        let score, recommendation;
        
        if (value > 50) {
            score = 100;
            recommendation = "Your balance is at the highest level! All types of activities are suitable. Maintain this level and continue training to improve stabilization.";
        } else if (value >= 40) {
            score = 75;
            recommendation = "Excellent result, you can move to more complex training programs. Add more complex yoga and TRX for further strengthening of muscles and improvement of balance.";
        } else if (value >= 30) {
            score = 50;
            recommendation = "For further progress, add balance exercises, as well as work with stabilizer muscles to improve coordination and maintain stability.";
        } else {
            score = 25;
            recommendation = "Consultation with an osteopath and checking the function of foot muscles are required. Focus on stabilization and activation of foot and shin muscles, relieving spasms, osteopathic correction. Add yoga to improve balance and strengthen muscles.";
        }

        return { value: `R: ${right}s, L: ${left}s`, score, recommendation, asymmetry: asymmetryData.asymmetry, asymmetryNote: asymmetryData.note };
    }


    function checkAsymmetry(right, left, thresholdPercent) {
        const max = Math.max(right, left);
        const min = Math.min(right, left);
        const differencePercent = (max > 0) ? ((max - min) / max) * 100 : 0;
        
        if (differencePercent > thresholdPercent) {
            const weakerSide = (right < left) ? 'Right' : 'Left';
            return {
                value: min, // Use the lower value for scoring
                asymmetry: true,
                note: `⚠️ Asymmetry (> ${thresholdPercent}%)`,
                recommendation: `It is recommended to strengthen the ${weakerSide.toLowerCase()} side with targeted exercises.`
            };
        } else {
            return {
                value: (right + left) / 2, // Use the average
                asymmetry: false,
                note: '✓ Symmetric',
                recommendation: ''
            };
        }
    }
    
    function getOverallDescription(score) {
        if (score >= 90) return "Excellent! Your physical form is optimal.";
        if (score >= 70) return "Good! You've made significant progress.";
        if (score >= 40) return "Needs Improvement. There is potential for growth.";
        return "Minimal. Efforts are needed for improvement.";
    }


    // --- DISPLAY LOGIC ---

    function displayResults(r) {
        resultsContainer.classList.remove('hidden');
        resultsContainer.innerHTML = `
            <h2>📑 Results Summary</h2>

            <div class="overall-result">
                <h3>Overall Score</h3>
                <div class="overall-score">${r.overallScore.toFixed(0)}%</div>
                <div class="overall-description">${r.overallDescription}</div>
            </div>

            <h2>📊 Detailed Results Table</h2>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Test</th>
                        <th>Entered Data</th>
                        <th>Score</th>
                        <th>Asymmetry Note</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1. Cardiorespiratory Endurance</td>
                        <td>${r.test1.value}</td>
                        <td>${r.test1.score}%</td>
                        <td>N/A</td>
                    </tr>
                    <tr>
                        <td>2. Strength (Dynamometer)</td>
                        <td>${r.test2.value}</td>
                        <td>${r.test2.score}%</td>
                        <td class="${r.test2.asymmetry ? 'asymmetry-warning' : ''}">${r.test2.asymmetryNote}</td>
                    </tr>
                    <tr>
                        <td>3. Cardio (Leg Swings)</td>
                        <td>${r.test3.value}</td>
                        <td>${r.test3.score}%</td>
                        <td>N/A</td>
                    </tr>
                    <tr>
                        <td>4a. Flexibility (Legs)</td>
                        <td>${r.test4a.value}</td>
                        <td>${r.test4a.score}%</td>
                        <td>N/A</td>
                    </tr>
                     <tr>
                        <td>4b. Flexibility (Arms/Shoulders)</td>
                        <td>${r.test4b.value}</td>
                        <td>${r.test4b.score}%</td>
                        <td class="${r.test4b.asymmetry ? 'asymmetry-warning' : ''}">${r.test4b.asymmetryNote}</td>
                    </tr>
                    <tr>
                        <td>5. Balance</td>
                        <td>${r.test5.value}</td>
                        <td>${r.test5.score}%</td>
                        <td class="${r.test5.asymmetry ? 'asymmetry-warning' : ''}">${r.test5.asymmetryNote}</td>
                    </tr>
                </tbody>
            </table>

            <h2>💡 Recommendations</h2>
            <div class="recommendation-card">
                <h3>Test 1: Cardiorespiratory Endurance (${r.test1.score}%)</h3>
                <p>${r.test1.recommendation}</p>
            </div>
            <div class="recommendation-card">
                <h3>Test 2: Strength (${r.test2.score}%)</h3>
                <p>${r.test2.recommendation}</p>
                ${r.test2.asymmetry ? `<p class="asymmetry-warning"><b>Asymmetry Detected:</b> ${r.test2.asymmetry.recommendation}</p>` : ''}
            </div>
            <div class="recommendation-card">
                <h3>Test 3: Cardio (Leg Swings) (${r.test3.score}%)</h3>
                <p>${r.test3.recommendation}</p>
            </div>
            <div class="recommendation-card">
                <h3>Test 4: Flexibility (Legs: ${r.test4a.score}%, Arms: ${r.test4b.score}%)</h3>
                <p><b>Legs:</b> ${r.test4a.recommendation}</p>
                <p><b>Arms/Shoulders:</b> ${r.test4b.recommendation}</p>
                 ${r.test4b.asymmetry ? `<p class="asymmetry-warning"><b>Asymmetry Detected (Arms):</b> ${r.test4b.asymmetry.recommendation}</p>` : ''}
            </div>
            <div class="recommendation-card">
                <h3>Test 5: Balance (${r.test5.score}%)</h3>
                <p>${r.test5.recommendation}</p>
                ${r.test5.asymmetry ? `<p class="asymmetry-warning"><b>Asymmetry Detected:</b> ${r.test5.asymmetry.recommendation}</p>` : ''}
            </div>
            
            <a href="${generateWhatsAppLink(r)}" target="_blank" class="whatsapp-btn">Send Results via WhatsApp 📤</a>
        `;
    }

    function generateWhatsAppLink(r) {
        let message = `*Functional Test Results Summary* 🌟\n\n`;
        message += `*Overall Score: ${r.overallScore.toFixed(0)}%* (${r.overallDescription})\n\n`;
        message += `*Detailed Scores:*\n`;
        message += `1. Cardio Endurance: ${r.test1.score}%\n`;
        message += `2. Strength: ${r.test2.score}% ${r.test2.asymmetry ? '(Asymmetry!)' : ''}\n`;
        message += `3. Leg Swings: ${r.test3.score}%\n`;
        message += `4. Flexibility (Legs/Arms): ${r.test4a.score}% / ${r.test4b.score}% ${r.test4b.asymmetry ? '(Asymmetry!)' : ''}\n`;
        message += `5. Balance: ${r.test5.score}% ${r.test5.asymmetry ? '(Asymmetry!)' : ''}\n\n`;
        message += `*Key Recommendation:*\n`;
        if (r.overallScore < 70) {
            message += `Focus on improving overall fitness, starting with the areas with the lowest scores. Consistency is key!`;
        } else {
            message += `Great work! Continue to challenge yourself and maintain your excellent fitness level.`;
        }

        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    }
});
