import styles from './App.module.scss';

const App: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pomodoro Manager</h1>
      <p className={styles.subtitle}>Focus. Track. Achieve.</p>
    </div>
  );
};

export default App;
