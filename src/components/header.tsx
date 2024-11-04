import { useEffect, useState } from 'react';
import { Button, List, Divider, Avatar } from 'antd';
import { HeartOutlined } from '@ant-design/icons';

function Header() {
  const [tabUrl, setTabUrl] = useState<string>("");
  const [title, setTitle] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [likeNumber, setLikeNumber] = useState<number | null>(null);
  const [data, setData] = useState<string[]>([]);

  const adjectives = [
    "Happy", "Brave", "Silent", "Clever", "Quick",
    "Fierce", "Gentle", "Curious", "Wise", "Sly",
    "Mighty", "Noble", "Charming", "Radiant", "Bold",
    "Daring", "Lucky", "Swift", "Vibrant", "Eager",
    "Creative", "Dynamic", "Loyal", "Playful", "Energetic",
    "Fearless", "Ambitious", "Witty", "Inventive", "Bright",
    "Bold", "Cunning", "Graceful", "Stellar", "Resourceful",
    "Inventive", "Joyful", "Zealous", "Calm", "Serene"
  ];

  const nouns = [
      "Cat", "Dog", "Explorer", "Warrior", "Sky",
      "Mountain", "River", "Phoenix", "Tiger", "Leaf",
      "Star", "Wanderer", "Knight", "Shadow", "Wizard",
      "Dragon", "Forest", "Ocean", "Dreamer", "Sailor",
      "Knight", "Hawk", "Whale", "Falcon", "Tiger",
      "Ghost", "Pathfinder", "Bard", "Nomad", "Guardian",
      "Hero", "Vortex", "Echo", "Hunter", "Explorer",
      "Sphinx", "Golem", "Sorcerer", "Raven", "Mermaid"
  ];

  const maxNumber = 999; 
  const usernameSet = new Set<string>();

  function getRandomElement<T>(array: T[]): T {
      return array[Math.floor(Math.random() * array.length)];
  }

  function generateUsername(): string {
      const adj = getRandomElement(adjectives);
      const noun = getRandomElement(nouns);
      const num = Math.floor(Math.random() * maxNumber) + 1; 
      return `${adj}${noun}${num}`;
  }

  function generateUniqueUsernames(count: number): string[] {
      while (usernameSet.size < count) {
          const username = generateUsername();
          usernameSet.add(username); 
      }
      return Array.from(usernameSet);
  }

  useEffect(() => {
    if (likeNumber !== null) {
      const uniqueUsernames = generateUniqueUsernames(likeNumber);
      setData(uniqueUsernames);
    }
  }, [likeNumber]);

  // Fetch active tab URL
  async function getActiveTabUrl(): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        resolve(activeTab?.url);
      });
    });
  }

  function getTitle() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            func: () => {
              const xpath = "/html/body/div/div[1]/div[2]/main/article/div[2]/section[1]/div[1]/div[1]/div/h1";
              const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
              const node = result.singleNodeValue;
              return node?.textContent?.trim() || null;
            },
          },
          (injectionResults) => {
            const [result] = injectionResults;
            setTitle(result?.result || "N/A");
          }
        );
      }
    });
  }

  function getImage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            func: () => {
              const xpath = "/html/body/div/div[1]/div[2]/main/article/div[1]/section/div[2]/div/div[2]/div/div[1]/div[2]/div/div[1]/div/div/div/div/figure/div[2]/picture/img";
              const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
              const imgElement = result.singleNodeValue as HTMLImageElement;
              return imgElement?.src || null;
            },
          },
          (injectionResults) => {
            const [result] = injectionResults;
            setImageUrl(result?.result || null);
          }
        );
      }
    });
  }

  function getLikeNumber() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: activeTab.id },
            func: () => {
              const xpath = "/html/body/div/div[1]/div[2]/main/article/div[2]/section[1]/section[2]/div/div/div[1]/div/div[1]/button/span";
              const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
              const node = result.singleNodeValue;
              return node?.textContent?.trim() || null;
            },
          },
          (injectionResults) => {
            const [result] = injectionResults;
            setLikeNumber(result?.result ? parseInt(result.result) : null); // Convert to number
          }
        );
      }
    });
  }

  // Fetch data on component mount
  useEffect(() => {
    getActiveTabUrl().then((url) => {
      if (url) setTabUrl(url);
    });
    getTitle();
    getImage();
    getLikeNumber();
  }, []);

  return (
    <div className="flex flex-col items-center justify-between flex-wrap bg-teal-500 p-6">
      {tabUrl && (
        <div className="text-blue-500 text-[12px]">
          <span>WebSite: {tabUrl}</span>
        </div>
      )}
      <div className='flex items-center justify-between gap-2 pt-2'>
        {imageUrl && (
          <img src={imageUrl} alt="Scraped Image" className='w-20' />
        )}
        <div>
          <div className='flex flex-row flex-wrap w-60 text-[14px] long-text'>{title || "None"}</div>
          <Button type='primary' className='w-full'>
            <HeartOutlined /> {likeNumber !== null ? likeNumber : "N/A"}
          </Button>
        </div>
      </div>
      <Divider />
      <div className='w-full h-40 overflow-y-scroll'>
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                title={<a href="https://ant.design">{item}</a>}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}

export default Header;
