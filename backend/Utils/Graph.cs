// Utils/Graph.cs
using System;
using System.Collections;

namespace MedicalDemo.Utils
{
    public class Edge
    {
        public int destination, reverse;
        public int currentCap, originalCap;
        
        public Edge(int destination, int reverse, int cap)
        {
            this.destination = destination;
            this.reverse = reverse;
            currentCap = cap;
            originalCap = cap;
        }
        
        public int Flow()
        {
            return originalCap - currentCap;
        }
    }

    public class Graph
    {
        int[] level, pointers, queue;
        public ArrayList edgeList;
        public ArrayList adjList;
        
        public Graph(int nodesAmt)
        {
            level = new int[nodesAmt];
            pointers = new int[nodesAmt]; 
            queue = new int[nodesAmt];

            edgeList = new ArrayList();
            adjList = new ArrayList();
            for(int i = 0; i < nodesAmt; i++)
            {
                adjList.Add(new ArrayList());
            }
        }
        
        public void AddEdge(int start, int end, int capacity)
        {
            var edge = (start, end, capacity);
            edgeList.Add(edge);
        }
        
        public void AddEdgeToAdj(int start, int end, int capacity) 
        {
            ((ArrayList)adjList[start]).Add(new Edge(end, ((ArrayList)adjList[end]).Count, capacity));
            ((ArrayList)adjList[end]).Add(new Edge(start, ((ArrayList)adjList[start]).Count - 1, 0));
        }

        private int Dfs(int currNode, int sink, int flow)
        {
            if(currNode == sink || flow == 0)
            {
                return flow;
            }
            for (; pointers[currNode] < ((ArrayList)adjList[currNode]).Count; pointers[currNode]++) 
            {
                Edge currEdge = (Edge)(((ArrayList)adjList[currNode])[pointers[currNode]]);
                
                if(level[currEdge.destination] == level[currNode] + 1)
                {
                    int push = Dfs(currEdge.destination, sink, Math.Min(flow, currEdge.currentCap));
                    if(push != 0)
                    {
                        currEdge.currentCap -= push;
                        ((Edge)(((ArrayList)adjList[currEdge.destination])[currEdge.reverse])).currentCap += push;
                        return push;
                    }
                }
            }
            return 0;
        }

        public int GetFlow(int source, int sink)
        {
            int seed = (int) DateTime.Now.Ticks;
            Random rand = new Random(seed);
            
            // Randomize edge processing
            for(int i = 0; i < edgeList.Count; i++)
            {
                int j = rand.Next(i, edgeList.Count);
                if(i != j)
                {
                    var tmp = edgeList[i];
                    edgeList[i] = edgeList[j];
                    edgeList[j] = tmp;
                }
                var edge = (ValueTuple<int, int, int>) edgeList[i];
                AddEdgeToAdj(edge.Item1, edge.Item2, edge.Item3);
            }
            
            int flow = 0;
            queue[0] = source;
            int currFlow = -1;
            
            while (currFlow != 0)
            {
                Array.Clear(pointers, 0, pointers.Length);
                Array.Clear(level, 0, level.Length);
                
                int qStart = 0;
                int qEnd = 1;
                level[source] = 1;
                
                while (qStart < qEnd && level[sink] == 0)
                {
                    int currNode = queue[qStart];
                    qStart++;
                    
                    for (int listIndex = 0; listIndex < ((ArrayList)adjList[currNode]).Count; listIndex++)
                    {
                        Edge currEdge = (Edge)(((ArrayList)adjList[currNode])[listIndex]);
                        int nextNode = currEdge.destination;

                        if (level[nextNode] == 0 && currEdge.currentCap > 0)
                        {
                            level[nextNode] = level[currNode] + 1;
                            queue[qEnd] = nextNode;
                            qEnd++;
                        }
                    }
                }

                currFlow = 0;
                int tmp = -1;
                while (tmp != 0)
                {
                    tmp = Dfs(source, sink, int.MaxValue);
                    currFlow += tmp;
                }

                flow += currFlow;
            }
            return flow;
        }
    }
}