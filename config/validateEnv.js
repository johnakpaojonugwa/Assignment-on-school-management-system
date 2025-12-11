import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'CLOUD_NAME',
    'CLOUD_API_KEY',
    'CLOUD_API_SECRET',
    'PORT'
];

export const validateEnv = () => {
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        process.exit(1);
    }
    
    console.log('✅ All required environment variables are configured');
};
