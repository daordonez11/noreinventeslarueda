import { Octokit } from '@octokit/rest';

let octokitClient: Octokit | null = null;

function getGitHubClient(): Octokit {
  if (octokitClient) {
    return octokitClient;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }

  octokitClient = new Octokit({
    auth: token,
  });

  return octokitClient;
}

interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  stars: number;
  forksCount: number;
  language: string | null;
  pushedAt: string | null;
  topics: string[];
}

export const gitHub = {
  async searchRepositories(
    query: string,
    sortBy: 'stars' | 'forks' | 'updated' = 'stars',
    perPage: number = 30,
    page: number = 1
  ): Promise<{ repositories: Repository[]; totalCount: number }> {
    try {
      const client = getGitHubClient();

      const response = await client.search.repos({
        q: query,
        sort: sortBy,
        order: 'desc',
        per_page: perPage,
        page,
      });

      const repositories = response.data.items.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        htmlUrl: repo.html_url,
        stars: repo.stargazers_count,
        forksCount: repo.forks_count,
        language: repo.language,
        pushedAt: repo.pushed_at,
        topics: repo.topics || [],
      }));

      return {
        repositories,
        totalCount: response.data.total_count,
      };
    } catch (error) {
      console.error('GitHub search error:', error);
      throw error;
    }
  },

  async getRepository(owner: string, repo: string): Promise<Repository> {
    try {
      const client = getGitHubClient();

      const response = await client.repos.get({
        owner,
        repo,
      });

      return {
        id: response.data.id,
        name: response.data.name,
        fullName: response.data.full_name,
        description: response.data.description,
        htmlUrl: response.data.html_url,
        stars: response.data.stargazers_count,
        forksCount: response.data.forks_count,
        language: response.data.language,
        pushedAt: response.data.pushed_at,
        topics: response.data.topics || [],
      };
    } catch (error) {
      console.error(`GitHub getRepository error for ${owner}/${repo}:`, error);
      throw error;
    }
  },

  async getRateLimitStatus(): Promise<{
    limit: number;
    remaining: number;
    reset: number;
  }> {
    try {
      const client = getGitHubClient();

      const response = await client.rateLimit.get();

      return {
        limit: response.data.resources.core.limit,
        remaining: response.data.resources.core.remaining,
        reset: response.data.resources.core.reset,
      };
    } catch (error) {
      console.error('GitHub getRateLimitStatus error:', error);
      throw error;
    }
  },
};
