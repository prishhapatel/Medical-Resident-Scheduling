using System.Collections;

namespace MedicalDemo.Algorithm;

public class Edge
{

    public int destination, reverse; // destination is node, reverse is the index
    public int currentCap, originalCap; // days
    
    public Edge(int destination, int reverse, int cap)
    {
        this.destination = destination;
        this.reverse = reverse;
        currentCap = cap;
        originalCap = cap;
    }
    public int flow()
    {
        return originalCap  - currentCap; // allow flows to be negative for finding reverse edge flows
        // return Math.Max(originalCap-currentCap, 0);
    }
}
public class Graph
{
    int[] level, pointers, queue;
    public ArrayList edgeList;
    public ArrayList adjList;
    
    public Graph(int nodesAmt)
    {
        level = new int[nodesAmt]; // array of size n where n is number of nodes
        pointers = new int[nodesAmt]; 
        queue = new int[nodesAmt];

        edgeList = new ArrayList();
        adjList = new ArrayList();
        for(int i = 0; i < nodesAmt; i++)
        {
            adjList.Add(new ArrayList()); // creating a row for every node in adj list but will be jagged, not every row is same size
        }

    }
    public void addEdge(int start, int end, int capacity) //adds to edgelist
    {
        var edge = (start, end, capacity); //tuple in c#
        edgeList.Add(edge);
    }
    public void addEdgeToAdj(int start, int end, int capacity) 
    {
        ((ArrayList)(adjList[start])).Add(new Edge(end, ((ArrayList)(adjList[end])).Count,capacity));
        ((ArrayList)(adjList[end])).Add(new Edge(start, ((ArrayList)(adjList[start])).Count - 1, 0));
    }

    int dfs(int currNode, int sink, int flow)
    {
        if(currNode == sink || flow == 0) // did we reach the end or did we run out of flow
        {
            return flow;
        }
        for (/*start at prev index*/; pointers[currNode] < ((ArrayList)(adjList[currNode])).Count; pointers[currNode]++) 
        {
            Edge currEdge = (Edge)(((ArrayList)(adjList[currNode]))[pointers[currNode]]); //this is like a pointer.. but in c#
            
            if(level[currEdge.destination] == level[currNode] + 1) // if one level deeper, perform analysis
            {
                int push = dfs(currEdge.destination, sink, Math.Min(flow, currEdge.currentCap));
                if(push != 0)
                {
                    currEdge.currentCap -= push;
                    ((Edge)(((ArrayList)(adjList[currEdge.destination]))[currEdge.reverse])).currentCap += push;
                    return push;
                }
            }
        }
        return 0;
    }

    public int getFlow(int source, int sink)
    {
        int seed = (int) DateTime.Now.Ticks;
        Random rand = new Random(seed);
        for(int i = 0; i < edgeList.Count; i++) // take edges from edge list, permute them, then put them in the adjacency list
        {
            int j = rand.Next(i, edgeList.Count); // generating a random index between the current location and end of list
            // pick a random value for spot i ^
            // now swap
            if(i != j)
            {
                var tmp = edgeList[i];
                edgeList[i] = edgeList[j];
                edgeList[j] = tmp;
            }
            var edge = (ValueTuple<int, int, int>) (edgeList[i]);
            addEdgeToAdj(edge.Item1, edge.Item2, edge.Item3);
        }
        int flow = 0;
        queue[0] = source;
        int currFlow = -1;
        while (currFlow != 0)
        {
            for (int curNode = 0; curNode < queue.Length; curNode++)
            {
                pointers[curNode] = 0;
                level[curNode] = 0;
            }
            int qStart = 0;
            int qEnd = 1;
            level[source] = 1;
            while (qStart < qEnd && level[sink] == 0)
            {
                int currNode = queue[qStart];
                
                qStart++;
                for (int listIndex = 0; listIndex < ((ArrayList)(adjList[currNode])).Count; listIndex++)
                {
                    Edge currEdge = (Edge)(((ArrayList)(adjList[currNode]))[listIndex]);
                    int nextNode = currEdge.destination;

                    // Check if the next nodes has not been visited and the edge can have flow sent across
                    if (level[nextNode] == 0 && currEdge.currentCap > 0)
                    {
                        // Update the level for the next node
                        level[nextNode] = level[currNode] + 1;
                        
                        // Enqueue the next node
                        queue[qEnd] = nextNode;
                        qEnd++;
                    }
                }
            }

            // Grab flow while we can
            currFlow = 0;
            int tmp = -1;
            while (tmp != 0)
            {
                tmp = dfs(source, sink, 987654321);
                currFlow += tmp;
            }

            // Update result based on current flow
            flow += currFlow;
        }

        // Return the resulting maximum flow
        return flow;
    }
}