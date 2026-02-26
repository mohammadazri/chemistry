export interface ExperimentData {
    titrationData: { volume: number; ph: number }[];
    calculatedConcentration: number;
    techniqueErrors: string[];
    completionTimeSeconds: number;
}

export interface GradeResult {
    totalScore: number;
    breakdown: {
        concentrationAccuracy: number;
        dataQuality: number;
        techniqueScore: number;
        timeBonus: number;
    };
    grade: 'A' | 'B' | 'C' | 'F';
    feedback: string[];
}

export function gradeExperiment(data: ExperimentData): GradeResult {
    const expectedConcentration = 0.1;

    // 1. concentrationAccuracy (40 pts)
    const percentError = Math.abs(data.calculatedConcentration - expectedConcentration) / expectedConcentration * 100;
    let concentrationAccuracy = 0;
    if (percentError <= 1) concentrationAccuracy = 40;
    else if (percentError <= 2) concentrationAccuracy = 35;
    else if (percentError <= 5) concentrationAccuracy = 25;
    else concentrationAccuracy = 10;

    // 2. dataQuality (30 pts)
    const dataPoints = data.titrationData.length;
    let dataQuality = 0;
    if (dataPoints >= 30) dataQuality = 30;
    else if (dataPoints >= 20) dataQuality = 20;
    else if (dataPoints >= 10) dataQuality = 10;
    else dataQuality = 5;

    // 3. techniqueScore (20 pts)
    const numErrors = data.techniqueErrors.length;
    const techniqueScore = Math.max(0, 20 - (numErrors * 2));

    // 4. timeBonus (10 pts)
    const minutes = data.completionTimeSeconds / 60;
    let timeBonus = 4;
    if (minutes < 30) timeBonus = 10;
    else if (minutes <= 45) timeBonus = 7;

    const totalScore = concentrationAccuracy + dataQuality + techniqueScore + timeBonus;

    let grade: 'A' | 'B' | 'C' | 'F' = 'F';
    if (totalScore >= 90) grade = 'A';
    else if (totalScore >= 80) grade = 'B';
    else if (totalScore >= 70) grade = 'C';

    return {
        totalScore,
        breakdown: {
            concentrationAccuracy,
            dataQuality,
            techniqueScore,
            timeBonus
        },
        grade,
        feedback: data.techniqueErrors
    };
}
