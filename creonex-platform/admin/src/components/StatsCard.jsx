const StatsCard = ({ title, value, change, isPositive, icon: Icon }) => {
    return (
        <div className="stat-card">
            <div className="stat-info">
                <h3>{title}</h3>
                <div className="stat-value">{value}</div>
                <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
                    <span>{isPositive ? '↑' : '↓'} {change}</span>
                    <span style={{ color: '#888' }}>vs last week</span>
                </div>
            </div>
            <div className="stat-icon">
                <Icon size={24} />
            </div>
        </div>
    );
};

export default StatsCard;
