import { useEffect, useState } from 'react';

function Home() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Test de connexion au backend
    const testBackendConnection = async () => {
      try {
        // Test 1 : Route de test basique
        const testResponse = await fetch('http://localhost:5500/api/test');
        const testData = await testResponse.json();
        
        // Test 2 : Route PostgreSQL
        const dbResponse = await fetch('http://localhost:5500/api/data');
        const dbDataResult = await dbResponse.json();

        setBackendStatus(testData);
        setDbData(dbDataResult);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    testBackendConnection();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Chargement...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h1>Erreur de connexion</h1>
        <p>{error}</p>
        <p>Vérifie que le backend tourne sur http://localhost:5500</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bienvenue sur Mémoria</h1>
      
      {/* Section test backend */}
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>✅ Test Backend</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          {JSON.stringify(backendStatus, null, 2)}
        </pre>
      </div>

      {/* Section test PostgreSQL */}
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>✅ Test PostgreSQL</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
          {JSON.stringify(dbData, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default Home;