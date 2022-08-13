export async function get() {
    const url_base: string | undefined = process.env.API_HOST;
    if (url_base === undefined) {
        throw new Error('API_HSOT is not defined');
    }
    const [
        workExperienceData,
        projectsData,
    ] = await Promise.all([
        fetch(`${url_base}/work-experience`).then(res => res.json()),
        fetch(`${url_base}/personal-projects`).then(res => res.json()),
    ]);

    return {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: {
            workExperience: workExperienceData.message,
            projects: projectsData.message
        }
    };
}