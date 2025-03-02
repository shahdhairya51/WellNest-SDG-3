const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// GitHub README proxy endpoint to avoid CORS issues
app.get('/api/fetch-readme', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    console.log('Fetching README from URL:', url);
    
    // Extract username and repo from GitHub URL
    // Format: https://github.com/username/repo
    const githubRegex = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(githubRegex);
    
    if (!match) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }
    
    const [, username, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, ''); // Remove .git extension if present
    
    // GitHub API URL for README content
    const apiUrl = `https://api.github.com/repos/${username}/${cleanRepo}/readme`;
    console.log('GitHub API URL:', apiUrl);
    
    // Fetch README metadata from GitHub API
    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // Add GitHub token if available to increase rate limit
        // 'Authorization': 'token YOUR_GITHUB_TOKEN'
      }
    });
    
    // Get the download URL for the README content
    const downloadUrl = response.data.download_url;
    console.log('README download URL:', downloadUrl);
    
    // Fetch the actual README content
    const contentResponse = await axios.get(downloadUrl);
    console.log('README content fetched successfully');
    
    res.json({ content: contentResponse.data });
  } catch (error) {
    console.error('Error fetching README:', error.message);
    // More detailed error logging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch README content', 
      message: error.message,
      details: error.response ? error.response.data : null
    });
  }
});

// API endpoint for AI analysis - stub for now
app.post('/api/analyze-readme', async (req, res) => {
  const { readmeText } = req.body;
  
  if (!readmeText) {
    return res.status(400).json({ error: 'README text is required' });
  }
  
  console.log('Analyzing README text length:', readmeText.length);
  
  try {
    // This is a simplified mock analysis that extracts information from the README text
    // In a real app, this would use an AI model or more sophisticated analysis
    
    const mockAnalysis = {
      healthFocusAreas: [],
      sdg3Targets: [],
      technologiesUsed: [],
      targetAudience: [],
      isDeployed: false,
      deploymentLocation: ""
    };
    
    // Simple keyword matching to demonstrate functionality
    const readme = readmeText.toLowerCase();
    
    // Health focus areas
    if (readme.includes('mental health') || readme.includes('psychology')) 
      mockAnalysis.healthFocusAreas.push('Mental Health');
    if (readme.includes('healthcare access') || readme.includes('medical access')) 
      mockAnalysis.healthFocusAreas.push('Healthcare Access');
    if (readme.includes('disease prevention') || readme.includes('prevent disease')) 
      mockAnalysis.healthFocusAreas.push('Disease Prevention');
    if (readme.includes('nutrition') || readme.includes('wellness')) 
      mockAnalysis.healthFocusAreas.push('Nutrition & Wellness');
    if (readme.includes('emergency') || readme.includes('urgent care')) 
      mockAnalysis.healthFocusAreas.push('Emergency Response');
    if (readme.includes('research') || readme.includes('medical study')) 
      mockAnalysis.healthFocusAreas.push('Medical Research');
    if (readme.includes('infectious') || readme.includes('virus') || readme.includes('bacterial')) 
      mockAnalysis.healthFocusAreas.push('Infectious Disease Control');
    
    // For deep learning object detection repositories specifically
    if (readme.includes('deep learning') || readme.includes('object detection')) {
      mockAnalysis.technologiesUsed.push('AI/ML Model');
      mockAnalysis.targetAudience.push('Researchers');
      
      if (readme.includes('medical') || readme.includes('health'))
        mockAnalysis.sdg3Targets.push('3.4 Reduce non-communicable diseases');
    }
    
    // Technologies detection
    if (readme.includes('web') || readme.includes('website') || readme.includes('html')) 
      mockAnalysis.technologiesUsed.push('Web Application');
    if (readme.includes('mobile') || readme.includes('android') || readme.includes('ios')) 
      mockAnalysis.technologiesUsed.push('Mobile Application');
    if (readme.includes('ai') || readme.includes('machine learning') || readme.includes('neural')) 
      mockAnalysis.technologiesUsed.push('AI/ML Model');
    if (readme.includes('database') || readme.includes('sql') || readme.includes('nosql')) 
      mockAnalysis.technologiesUsed.push('Database System');
    if (readme.includes('visualization') || readme.includes('chart') || readme.includes('graph')) 
      mockAnalysis.technologiesUsed.push('Data Visualization');
    
    // Deployment detection
    if (readme.includes('deployed') || readme.includes('live') || readme.includes('production')) {
      mockAnalysis.isDeployed = true;
      
      // Try to extract deployment location
      const locationKeywords = ['hospital', 'clinic', 'university', 'research center', 'lab'];
      for (const keyword of locationKeywords) {
        if (readme.includes(keyword)) {
          mockAnalysis.deploymentLocation = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          break;
        }
      }
    }
    
    console.log('Analysis results:', mockAnalysis);
    res.json(mockAnalysis);
  } catch (error) {
    console.error('Error analyzing README:', error);
    res.status(500).json({ error: 'Failed to analyze README', message: error.message });
  }
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});