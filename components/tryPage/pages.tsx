import React, { useState, useEffect } from 'react';

function App() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPages = async () => {
            const urls = ["page1.html", "page2.html", "page3.html"];
            try {
                const responses = await Promise.all(urls.map(url => fetch(url).then(res => res.text())));
                setPages(responses);
                setLoading(false);
            } catch (error) {
                console.error("Error loading pages:", error);
            }
        };
        fetchPages();
    }, []);

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                pages.map((pageContent, index) => (
                    <div key={index} dangerouslySetInnerHTML={{ __html: pageContent }} />
                ))
            )}
        </div>
    );
}
export default App;
