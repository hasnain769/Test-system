document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const resultsContainer = document.getElementById('results-container');

    // Global constant for the new asymmetry recommendation
    const ASYMMETRY_RECOMMENDATION = "Attention: Asymmetry! ⚠️ Focus your efforts on the weaker side. Assess the innervation of the corresponding spinal segments, evaluate the activation and function of adjacent muscles, strengthen weakened muscles, and relieve muscle spasms or tension.";

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateInputs()) {
            const results = calculateAllResults();
            displayResults(results);
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('Please fill in all required fields with valid numbers before calculating.');
        }
    });

    function validateInputs() {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.classList.remove('input-error');
            if (!input.value || (input.type === 'number' && isNaN(parseFloat(input.value)))) {
                isValid = false;
                input.classList.add('input-error');
            }
        });
        return isValid;
    }

    // --- HELPER FUNCTIONS ---

    function checkAsymmetry(right, left, thresholdPercent) {
        const max = Math.max(right, left);
        const min = Math.min(right, left);
        const differencePercent = (max > 0) ? ((max - min) / max) * 100 : 0;
        
        return {
            isAsymmetric: differencePercent > thresholdPercent,
            weakerSide: (right < left) ? 'Right' : 'Left'
        };
    }

    function getOverallDescription(score) {
        if (score >= 90) return "Excellent! Your physical form is optimal.";
        if (score >= 70) return "Good! You've made significant progress.";
        if (score >= 40) return "Needs Improvement. There is potential for growth.";
        return "Minimal. Efforts are needed for improvement.";
    }

    // --- MAIN CALCULATION LOGIC ---

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

    // --- INDIVIDUAL TEST CALCULATORS ---

    function calculateCardioEndurance(val) {
        let score, recommendation;
        if (val > 90) { score = 100; recommendation = "Excellent cardiorespiratory endurance. All types of activities are suitable for further training. Keep it up and maintain a high level of physical activity to preserve excellent shape."; } 
        else if (val >= 60) { score = 75; recommendation = "Excellent result at this level. To continue improvements, add yoga, functional exercises, and TRX training for comprehensive body work and improved flexibility."; } 
        else if (val >= 45) { score = 50; recommendation = "Initial level of cardiorespiratory endurance. For further progress, add breathing practices and endurance training, as well as start working with interval cardio sessions to increase endurance with heart rate control."; } 
        else { score = 25; recommendation = "Efforts are needed for improvement. If values are below 30 seconds, it may indicate high stress, body acidification, and low endurance levels; it is necessary to improve overall health. It is recommended to focus on increasing general physical fitness and including regular cardio loads."; }
        return { value: `${val}s`, score, recommendation };
    }
    
    function calculateStrength(rightVal, leftVal, gender) {
        const getResult = (value, gender) => {
            const thresholds = (gender === 'male') ? { exc: 60, good: 45, avg: 40 } : { exc: 30, good: 25, avg: 15 };
            if (value > thresholds.exc) return { score: 100, rec: "Excellent result! All types of activities are suitable for further physical fitness improvement. Maintain a high level of training, and continue developing your skills." };
            if (value >= thresholds.good) return { score: 75, rec: "Good result, however it can be improved with TRX and functional exercises. This will help develop strength, endurance, and improve overall physical fitness." };
            if (value >= thresholds.avg) return { score: 50, rec: "Add strength training and learn to activate muscles more effectively. Work on engaging all muscle groups to improve results and progress." };
            return { score: 25, rec: "Focus on functional strength training and myofascial release to relieve spasms. If the strength difference between the right and left hand exceeds 15%, it is recommended to consult an osteopath or massage therapist to relieve tension in the arm, neck, and trapezius muscle to prevent injuries and improve results." };
        };
        const right = getResult(rightVal, gender);
        const left = getResult(leftVal, gender);
        const asymmetryInfo = checkAsymmetry(rightVal, leftVal, 25);
        return {
            value: `R: ${rightVal}kg, L: ${leftVal}kg`,
            score: (right.score + left.score) / 2,
            right: right,
            left: left,
            asymmetry: asymmetryInfo.isAsymmetric
        };
    }
    
    function calculateCardioPulse(val) {
        let score, recommendation;
        if (val <= 50) { score = 100; recommendation = "The heart’s response to load is excellent, you can increase the complexity of workouts. The body is well prepared and effectively handles loads without signs of overfatigue. Excellent adaptation allows for workouts without restrictions, but it is recommended to monitor the pulse in particularly complex workouts to ensure safety."; }
        else if (val <= 70) { score = 75; recommendation = "The heart’s response to load is very good, the body is well prepared and effectively handles loads without signs of overfatigue. Good adaptation allows for intense workouts and practices without significant restrictions, but always consider individual sensations."; }
        else if (val <= 80) { score = 50; recommendation = "The pulse response to load is average, indicating insufficient adaptation for more intense workouts. Need to improve adaptation and expand the program by adding endurance training, including resistance band exercises, cardio, and TRX. Integrate more cardio and functional training for further progress."; }
        else { score = 25; recommendation = "The pulse response to load is elevated, which may indicate the need for additional attention to overall health and the cardiovascular system. It is recommended to carefully monitor the pulse during all intense workouts to avoid overloads. Include breathing exercises for improved recovery and light cardio sessions for gradual adaptation."; }
        const pulseMap = { 95: '90-100%', 80: '80%', 65: '60-70%', 45: '<50%' };
        return { value: `Zone ${pulseMap[val]}`, score, recommendation };
    }
    
    function calculateFlexibilityLegs(val) {
        const textMap = { 25: 'Reach to knee', 50: 'Reach to shin/foot', 75: 'Reach to floor (fists)', 100: 'Reach to floor (palms)' };
        let recommendation;
        switch(val) {
            case 100: recommendation = "Excellent flexibility! Keep it up. If there is hypermobility, it is recommended to additionally strengthen muscles to maintain stability and prevent injuries."; break;
            case 75: recommendation = "Continue developing flexibility by adding more complex stretching workouts and functional exercises to improve mobility and strengthen muscles."; break;
            case 50: recommendation = "It is recommended to include practices for relieving muscle clamps and injury prevention: myofascial release (MFR), massage, yoga, and somatic methods to increase flexibility and mobility."; break;
            default: recommendation = "Consultation with an osteopath, massage, and basic stretching exercises, as well as light yoga, are required to improve flexibility and eliminate muscle tensions.";
        }
        return { value: textMap[val], score: val, recommendation };
    }

    function calculateFlexibilityArms(rightVal, leftVal) {
        const getResult = (value) => {
            let recommendation;
            switch(value) {
                case 100: recommendation = "Superior result. Excellent flexibility and neuromuscular coordination. Maintain current routine, and include controlled strength and mobility workouts to support joint health and prevent overstretching."; break;
                case 75: recommendation = "Significant progress. Good shoulder mobility and flexibility. Continue improving by adding functional training methods (e.g., TRX, yoga) and more advanced flexibility exercises while maintaining safe technique."; break;
                case 50: recommendation = "There is potential for improvement. Recommended to include myofascial release (MFR), massage, yoga, and exercises to relieve muscular tension and activate stabilizing muscles. This will enhance flexibility and help prevent injuries."; break;
                default: recommendation = "Efforts are needed for improvement. Possible issues with posture, innervation, or past shoulder injuries. A consultation with an osteopath is recommended, regular massage, and basic stretching exercises are recommended. Light yoga and gentle mobility work will help restore range of motion and reduce muscle tension.";
            }
            return { score: value, rec: recommendation };
        };
        const right = getResult(rightVal);
        const left = getResult(leftVal);
        const asymmetryInfo = checkAsymmetry(rightVal, leftVal, 25);
        const valueMap = { 25: "Fingers do not touch", 50: "Fingers touch but do not lock", 75: "Fingers form a loose grip", 100: "Fingers form a strong full grip" };
        return {
            value: `R: ${valueMap[rightVal]}, L: ${valueMap[leftVal]}`,
            score: (right.score + left.score) / 2,
            right: right,
            left: left,
            asymmetry: asymmetryInfo.isAsymmetric
        };
    }

    function calculateBalance(rightVal, leftVal) {
        const getResult = (value) => {
            if (value > 50) return { score: 100, rec: "Superior result. Your balance is at the highest level! All types of activities are suitable. Maintain this level and continue training to improve stabilization." };
            if (value >= 40) return { score: 75, rec: "Significant progress. Excellent result, you can move to more complex training programs. Add more complex yoga and TRX for further strengthening of muscles and improvement of balance." };
            if (value >= 30) return { score: 50, rec: "There is potential for improvement. For further progress, add balance exercises, as well as work with stabilizer muscles to improve coordination and maintain stability." };
            return { score: 25, rec: "Efforts are needed for improvement. Consultation with an osteopath and checking the function of foot muscles are required. Focus on stabilization and activation of foot and shin muscles, relieving spasms, osteopathic correction. Add yoga to improve balance and strengthen muscles." };
        };
        const right = getResult(rightVal);
        const left = getResult(leftVal);
        const asymmetryInfo = checkAsymmetry(rightVal, leftVal, 25);
        return {
            value: `R: ${rightVal}s, L: ${leftVal}s`,
            score: (right.score + left.score) / 2,
            right: right,
            left: left,
            asymmetry: asymmetryInfo.isAsymmetric
        };
    }

    // --- DISPLAY LOGIC ---

    function displayResults(r) {
        resultsContainer.classList.remove('hidden');

        // Build the results table
        let tableHTML = `
            <h2>📊 Detailed Results Table</h2>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Test</th>
                        <th>Entered Data</th>
                        <th>Final Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>1. Cardiorespiratory Endurance</td><td>${r.test1.value}</td><td>${r.test1.score.toFixed(1)}%</td></tr>
                    <tr><td>2. Strength (Dynamometer)</td><td>${r.test2.value} ${r.test2.asymmetry ? '<span class="asymmetry-flag">⚠️ Asymmetry</span>' : ''}</td><td>${r.test2.score.toFixed(1)}%</td></tr>
                    <tr><td>3. Cardio (Leg Swings)</td><td>${r.test3.value}</td><td>${r.test3.score.toFixed(1)}%</td></tr>
                    <tr><td>4a. Flexibility (Legs)</td><td>${r.test4a.value}</td><td>${r.test4a.score.toFixed(1)}%</td></tr>
                    <tr><td>4b. Flexibility (Arms/Shoulders)</td><td>${r.test4b.value} ${r.test4b.asymmetry ? '<span class="asymmetry-flag">⚠️ Asymmetry</span>' : ''}</td><td>${r.test4b.score.toFixed(1)}%</td></tr>
                    <tr><td>5. Balance</td><td>${r.test5.value} ${r.test5.asymmetry ? '<span class="asymmetry-flag">⚠️ Asymmetry</span>' : ''}</td><td>${r.test5.score.toFixed(1)}%</td></tr>
                </tbody>
            </table>`;

        // Build recommendations section
        let recommendationsHTML = `<h2>💡 Recommendations</h2>`;
        const tests = [
            { name: "Test 1: Cardiorespiratory Endurance", data: r.test1 },
            { name: "Test 2: Strength", data: r.test2 },
            { name: "Test 3: Cardio (Leg Swings)", data: r.test3 },
            { name: "Test 4a: Flexibility (Legs)", data: r.test4a },
            { name: "Test 4b: Flexibility (Arms/Shoulders)", data: r.test4b },
            { name: "Test 5: Balance", data: r.test5 }
        ];

        tests.forEach(test => {
            recommendationsHTML += `<div class="recommendation-card"><h3>${test.name}</h3>`;
            if (test.data.asymmetry) {
                // Asymmetric test with separate recommendations
                recommendationsHTML += `
                    <div class="side-recommendation">
                        <p><b>Right Side (${test.data.right.score}%):</b> ${test.data.right.rec}</p>
                    </div>
                    <div class="side-recommendation">
                        <p><b>Left Side (${test.data.left.score}%):</b> ${test.data.left.rec}</p>
                    </div>
                    <div class="asymmetry-warning">${ASYMMETRY_RECOMMENDATION}</div>`;
            } else {
                // Symmetric test with single recommendation
                recommendationsHTML += `<p>${test.data.recommendation}</p>`;
            }
            recommendationsHTML += `</div>`;
        });
        
        resultsContainer.innerHTML = `
            <h2>📑 Results Summary</h2>
            <div class="overall-result">
                <h3>Overall Score</h3>
                <div class="overall-score">${r.overallScore.toFixed(1)}%</div>
                <div class="overall-description">${r.overallDescription}</div>
            </div>
            ${tableHTML}
            ${recommendationsHTML}
            <a href="${generateWhatsAppLink(r)}" target="_blank" class="whatsapp-btn">Send Results via WhatsApp 📤</a>
        `;
    }

    function generateWhatsAppLink(r) {
        let message = `*Functional Test Results Summary* 🌟\n\n`;
        message += `*Overall Score: ${r.overallScore.toFixed(1)}%* (${r.overallDescription})\n\n`;
        message += `*Detailed Scores:*\n`;
        message += `1. Cardio Endurance: ${r.test1.score.toFixed(1)}%\n`;
        message += `2. Strength: ${r.test2.score.toFixed(1)}% ${r.test2.asymmetry ? '(Asymmetry!)' : ''}\n`;
        message += `3. Leg Swings: ${r.test3.score.toFixed(1)}%\n`;
        message += `4a. Flex (Legs): ${r.test4a.score.toFixed(1)}%\n`;
        message += `4b. Flex (Arms): ${r.test4b.score.toFixed(1)}% ${r.test4b.asymmetry ? '(Asymmetry!)' : ''}\n`;
        message += `5. Balance: ${r.test5.score.toFixed(1)}% ${r.test5.asymmetry ? '(Asymmetry!)' : ''}\n\n`;
        message += `*Key Action:*\nCheck the detailed report for specific recommendations for each test. Focus on improving areas with lower scores and addressing any detected asymmetry.`;
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    }
});